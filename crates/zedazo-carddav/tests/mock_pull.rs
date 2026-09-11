//! Integración contra un servidor CardDAV mockeado (httpmock, sin PII).

use httpmock::prelude::*;
use zedazo_carddav::config::CardDavConfig;
use zedazo_carddav::{parse_and_validate, CardDavClient, CardDavError};

const USER: &str = "ada";
const PASS: &str = "app-password";

const VCARD: &str = "BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Ada Example\r\nUID:urn:uuid:00000000-0000-4000-a000-000000000001\r\nEMAIL:ada@example.test\r\nEND:VCARD\r\n";

fn principal_xml() -> String {
    r#"<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:">
  <d:response>
    <d:href>/remote.php/dav/</d:href>
    <d:propstat>
      <d:prop>
        <d:current-user-principal>
          <d:href>/remote.php/dav/principals/users/ada/</d:href>
        </d:current-user-principal>
      </d:prop>
      <d:status>HTTP/1.1 200 OK</d:status>
    </d:propstat>
  </d:response>
</d:multistatus>"#
        .into()
}

fn home_xml() -> String {
    r#"<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:carddav">
  <d:response>
    <d:href>/remote.php/dav/principals/users/ada/</d:href>
    <d:propstat>
      <d:prop>
        <c:addressbook-home-set>
          <d:href>/remote.php/dav/addressbooks/users/ada/</d:href>
        </c:addressbook-home-set>
      </d:prop>
      <d:status>HTTP/1.1 200 OK</d:status>
    </d:propstat>
  </d:response>
</d:multistatus>"#
        .into()
}

fn home_listing_xml() -> String {
    r#"<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:" xmlns:card="urn:ietf:params:xml:ns:carddav">
  <d:response>
    <d:href>/remote.php/dav/addressbooks/users/ada/</d:href>
    <d:propstat>
      <d:prop>
        <d:displayname>Home</d:displayname>
        <d:resourcetype><d:collection/></d:resourcetype>
      </d:prop>
      <d:status>HTTP/1.1 200 OK</d:status>
    </d:propstat>
  </d:response>
  <d:response>
    <d:href>/remote.php/dav/addressbooks/users/ada/contacts/</d:href>
    <d:propstat>
      <d:prop>
        <d:displayname>Contactos</d:displayname>
        <d:resourcetype>
          <d:collection/>
          <card:addressbook/>
        </d:resourcetype>
      </d:prop>
      <d:status>HTTP/1.1 200 OK</d:status>
    </d:propstat>
  </d:response>
</d:multistatus>"#
        .into()
}

fn cards_listing_xml() -> String {
    r#"<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:">
  <d:response>
    <d:href>/remote.php/dav/addressbooks/users/ada/contacts/</d:href>
    <d:propstat>
      <d:prop>
        <d:resourcetype>
          <d:collection/>
        </d:resourcetype>
      </d:prop>
      <d:status>HTTP/1.1 200 OK</d:status>
    </d:propstat>
  </d:response>
  <d:response>
    <d:href>/remote.php/dav/addressbooks/users/ada/contacts/ada.vcf</d:href>
    <d:propstat>
      <d:prop>
        <d:getcontenttype>text/vcard</d:getcontenttype>
        <d:getetag>"etag-1"</d:getetag>
        <d:resourcetype/>
      </d:prop>
      <d:status>HTTP/1.1 200 OK</d:status>
    </d:propstat>
  </d:response>
</d:multistatus>"#
        .into()
}

fn is_propfind(req: &HttpMockRequest) -> bool {
    req.method.eq_ignore_ascii_case("PROPFIND")
}

fn config_for(server: &MockServer, addressbook: Option<&str>) -> CardDavConfig {
    let url = parse_and_validate(&server.base_url()).expect("loopback http");
    let addressbook = addressbook
        .map(|p| parse_and_validate(&format!("{}{p}", server.base_url())).expect("ab url"));
    CardDavConfig {
        url,
        username: USER.into(),
        password: PASS.into(),
        addressbook,
    }
}

fn mount_nextcloud(server: &MockServer) {
    server.mock(|when, then| {
        when.method(GET).path("/.well-known/carddav");
        then.status(301).header("Location", "/remote.php/dav/");
    });
    server.mock(|when, then| {
        when.method(GET).path("/remote.php/dav/");
        then.status(401);
    });

    server.mock(|when, then| {
        when.path("/remote.php/dav/").matches(is_propfind);
        then.status(207)
            .header("Content-Type", "application/xml")
            .body(principal_xml());
    });

    server.mock(|when, then| {
        when.path("/remote.php/dav/principals/users/ada/")
            .matches(is_propfind);
        then.status(207)
            .header("Content-Type", "application/xml")
            .body(home_xml());
    });

    server.mock(|when, then| {
        when.path("/remote.php/dav/addressbooks/users/ada/")
            .matches(is_propfind);
        then.status(207)
            .header("Content-Type", "application/xml")
            .body(home_listing_xml());
    });

    server.mock(|when, then| {
        when.path("/remote.php/dav/addressbooks/users/ada/contacts/")
            .matches(is_propfind);
        then.status(207)
            .header("Content-Type", "application/xml")
            .body(cards_listing_xml());
    });

    server.mock(|when, then| {
        when.method(GET)
            .path("/remote.php/dav/addressbooks/users/ada/contacts/ada.vcf");
        then.status(200)
            .header("Content-Type", "text/vcard")
            .body(VCARD);
    });
}

#[test]
fn pull_via_well_known_and_nextcloud_paths() {
    let server = MockServer::start();
    mount_nextcloud(&server);

    let client = CardDavClient::new(config_for(&server, None)).unwrap();
    let books = client.list_addressbooks().unwrap();
    assert_eq!(books.len(), 1);
    assert_eq!(books[0].displayname.as_deref(), Some("Contactos"));
    assert!(books[0]
        .url
        .path()
        .contains("/remote.php/dav/addressbooks/users/ada/contacts"));

    let pulled = client.pull(None).unwrap();
    assert_eq!(pulled.cards.len(), 1);
    assert!(pulled.concatenated_vcf().contains("FN:Ada Example"));
    assert!(pulled.concatenated_vcf().contains("ada@example.test"));
}

#[test]
fn explicit_addressbook_skips_well_known() {
    let server = MockServer::start();
    // Sin mock de well-known: si el cliente lo pide, falla.
    server.mock(|when, then| {
        when.path("/remote.php/dav/addressbooks/users/ada/contacts/")
            .matches(is_propfind);
        then.status(207)
            .header("Content-Type", "application/xml")
            .body(cards_listing_xml());
    });
    server.mock(|when, then| {
        when.method(GET)
            .path("/remote.php/dav/addressbooks/users/ada/contacts/ada.vcf");
        then.status(200).body(VCARD);
    });

    let client = CardDavClient::new(config_for(
        &server,
        Some("/remote.php/dav/addressbooks/users/ada/contacts/"),
    ))
    .unwrap();
    let books = client.list_addressbooks().unwrap();
    assert_eq!(books.len(), 1);

    let pulled = client.pull(None).unwrap();
    assert_eq!(pulled.cards.len(), 1);
    assert!(pulled.cards[0].vcard.contains("BEGIN:VCARD"));
}

#[test]
fn unauthorized_is_typed_error() {
    let server = MockServer::start();
    server.mock(|when, then| {
        when.path("/remote.php/dav/").matches(is_propfind);
        then.status(401);
    });

    let mut cfg = config_for(&server, None);
    cfg.url = parse_and_validate(&format!("{}/remote.php/dav/", server.base_url())).unwrap();
    let client = CardDavClient::new(cfg).unwrap();
    let err = client.list_addressbooks().unwrap_err();
    assert!(matches!(err, CardDavError::Unauthorized(_)));
}

#[test]
fn persistent_429_exhausts_retries() {
    let server = MockServer::start();
    server.mock(|when, then| {
        when.path("/remote.php/dav/addressbooks/users/ada/contacts/")
            .matches(is_propfind);
        then.status(429).header("Retry-After", "0");
    });
    let client = CardDavClient::new(config_for(
        &server,
        Some("/remote.php/dav/addressbooks/users/ada/contacts/"),
    ))
    .unwrap();
    let err = client.list_addressbooks().unwrap_err();
    assert!(matches!(err, CardDavError::RetriesExhausted { .. }));
}
