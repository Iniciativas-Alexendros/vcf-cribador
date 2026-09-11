//! Política de URL: HTTPS (TLS 1.2+) o HTTP solo a loopback (ADR-0018).

use std::net::IpAddr;

use reqwest::Url;

use crate::error::{CardDavError, CardDavResult};

/// Parsea y valida una URL de servidor CardDAV.
pub fn parse_and_validate(raw: &str) -> CardDavResult<Url> {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return Err(CardDavError::MissingUrl);
    }
    let url = Url::parse(trimmed).map_err(|e| CardDavError::InvalidUrl(e.to_string()))?;
    validate_server_url(&url)?;
    Ok(url)
}

/// HTTPS siempre; HTTP claro solo si el host es loopback.
pub fn validate_server_url(url: &Url) -> CardDavResult<()> {
    match url.scheme() {
        "https" => {
            if url.host_str().is_none() {
                return Err(CardDavError::InvalidUrl("https requiere un host".into()));
            }
            Ok(())
        }
        "http" => {
            let host = url.host_str().unwrap_or("");
            if is_loopback_host(host) {
                Ok(())
            } else {
                Err(CardDavError::CleartextForbidden)
            }
        }
        other => Err(CardDavError::UnsupportedScheme(other.to_string())),
    }
}

/// Host loopback: `localhost`, `127.0.0.0/8`, `::1`.
pub fn is_loopback_host(host: &str) -> bool {
    if host.eq_ignore_ascii_case("localhost") {
        return true;
    }
    let unbracketed = host.trim_matches(|c| c == '[' || c == ']');
    match unbracketed.parse::<IpAddr>() {
        Ok(ip) => ip.is_loopback(),
        Err(_) => false,
    }
}

/// Origen `scheme://host[:port]` con barra final.
pub fn origin_with_slash(url: &Url) -> CardDavResult<Url> {
    let mut origin = url.origin().ascii_serialization();
    if !origin.ends_with('/') {
        origin.push('/');
    }
    Url::parse(&origin).map_err(|e| CardDavError::InvalidUrl(e.to_string()))
}

/// Asegura barra final en colecciones DAV.
pub fn ensure_trailing_slash(url: &Url) -> Url {
    let mut s = url.to_string();
    if s.ends_with('/') {
        url.clone()
    } else {
        s.push('/');
        Url::parse(&s).unwrap_or_else(|_| url.clone())
    }
}

/// Une un `href` DAV (absoluto o de ruta) al origen del `base`.
pub fn resolve_href(base: &Url, href: &str) -> CardDavResult<Url> {
    let href = href.trim();
    if href.is_empty() {
        return Err(CardDavError::Protocol("href DAV vacío".into()));
    }
    base.join(href)
        .map_err(|e| CardDavError::InvalidUrl(e.to_string()))
}

/// Compara dos URLs de colección ignorando la barra final.
pub fn same_collection(a: &Url, b: &Url) -> bool {
    trim_slash(a.as_str()) == trim_slash(b.as_str())
}

fn trim_slash(s: &str) -> &str {
    s.trim_end_matches('/')
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn https_remoto_ok() {
        parse_and_validate("https://cloud.example.test/remote.php/dav/").unwrap();
    }

    #[test]
    fn http_loopback_ok() {
        parse_and_validate("http://127.0.0.1:8080/dav/").unwrap();
        parse_and_validate("http://localhost/dav/").unwrap();
        parse_and_validate("http://[::1]/dav/").unwrap();
    }

    #[test]
    fn http_remoto_prohibido() {
        let err = parse_and_validate("http://cloud.example.test/dav/").unwrap_err();
        assert!(matches!(err, CardDavError::CleartextForbidden));
    }

    #[test]
    fn ftp_prohibido() {
        let err = parse_and_validate("ftp://127.0.0.1/dav").unwrap_err();
        assert!(matches!(err, CardDavError::UnsupportedScheme(_)));
    }

    #[test]
    fn resolve_path_absolute() {
        let base = Url::parse("https://cloud.example.test/remote.php/dav/").unwrap();
        let joined = resolve_href(&base, "/remote.php/dav/principals/users/ada/").unwrap();
        assert_eq!(
            joined.as_str(),
            "https://cloud.example.test/remote.php/dav/principals/users/ada/"
        );
    }
}
