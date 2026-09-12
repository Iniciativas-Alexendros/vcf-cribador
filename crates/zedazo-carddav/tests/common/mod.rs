//! Servidor HTTP/1.1 mínimo para tests CardDAV (loopback; sin httpmock).

use std::io::{Read, Write};
use std::net::{SocketAddr, TcpListener, TcpStream};
use std::sync::{Arc, Mutex};
use std::thread;

#[derive(Clone)]
struct Route {
    method: String,
    path: String,
    status: u16,
    headers: Vec<(String, String)>,
    body: Vec<u8>,
}

/// Mock HTTP en 127.0.0.1.
pub struct MockHttp {
    pub addr: SocketAddr,
    routes: Arc<Mutex<Vec<Route>>>,
}

impl MockHttp {
    pub fn start() -> Self {
        let listener = TcpListener::bind("127.0.0.1:0").expect("bind loopback");
        let addr = listener.local_addr().expect("local addr");
        let routes = Arc::new(Mutex::new(Vec::new()));
        let routes_thread = Arc::clone(&routes);
        thread::spawn(move || {
            for stream in listener.incoming() {
                let Ok(stream) = stream else { continue };
                let routes = routes_thread.lock().expect("routes").clone();
                let _ = handle_conn(stream, &routes);
            }
        });
        Self { addr, routes }
    }

    pub fn base_url(&self) -> String {
        format!("http://{}", self.addr)
    }

    pub fn mock(
        &self,
        method: &str,
        path: &str,
        status: u16,
        headers: &[(&str, &str)],
        body: impl AsRef<[u8]>,
    ) {
        self.routes.lock().expect("routes").push(Route {
            method: method.to_ascii_uppercase(),
            path: path.to_string(),
            status,
            headers: headers
                .iter()
                .map(|(k, v)| ((*k).to_string(), (*v).to_string()))
                .collect(),
            body: body.as_ref().to_vec(),
        });
    }
}

fn handle_conn(mut stream: TcpStream, routes: &[Route]) -> std::io::Result<()> {
    let (method, path, body_len) = read_head(&mut stream)?;
    if body_len > 0 {
        let mut rest = vec![0u8; body_len];
        stream.read_exact(&mut rest)?;
    }
    let route = routes.iter().find(|r| r.method == method && r.path == path);
    match route {
        Some(r) => write_response(&mut stream, r),
        None => {
            let not_found = Route {
                method: String::new(),
                path: String::new(),
                status: 404,
                headers: Vec::new(),
                body: b"not found".to_vec(),
            };
            write_response(&mut stream, &not_found)
        }
    }
}

fn read_head(stream: &mut TcpStream) -> std::io::Result<(String, String, usize)> {
    let mut buf = Vec::new();
    let mut tmp = [0u8; 512];
    loop {
        let n = stream.read(&mut tmp)?;
        if n == 0 {
            break;
        }
        buf.extend_from_slice(&tmp[..n]);
        if let Some(pos) = find_double_crlf(&buf) {
            let head = std::str::from_utf8(&buf[..pos]).unwrap_or("");
            let leftover = buf.len() - (pos + 4);
            let (method, path, content_len) = parse_head(head);
            let still = content_len.saturating_sub(leftover);
            return Ok((method, path, still));
        }
        if buf.len() > 64 * 1024 {
            break;
        }
    }
    Err(std::io::Error::new(
        std::io::ErrorKind::UnexpectedEof,
        "cabeceras HTTP incompletas",
    ))
}

fn find_double_crlf(buf: &[u8]) -> Option<usize> {
    buf.windows(4).position(|w| w == b"\r\n\r\n")
}

fn parse_head(head: &str) -> (String, String, usize) {
    let mut lines = head.split("\r\n");
    let req = lines.next().unwrap_or("");
    let mut parts = req.split_whitespace();
    let method = parts.next().unwrap_or("GET").to_ascii_uppercase();
    let path_q = parts.next().unwrap_or("/");
    let path = path_q.split('?').next().unwrap_or("/").to_string();
    let mut content_len = 0usize;
    for line in lines {
        let Some((k, v)) = line.split_once(':') else {
            continue;
        };
        if k.eq_ignore_ascii_case("content-length") {
            content_len = v.trim().parse().unwrap_or(0);
        }
    }
    (method, path, content_len)
}

fn write_response(stream: &mut TcpStream, route: &Route) -> std::io::Result<()> {
    let reason = match route.status {
        200 => "OK",
        207 => "Multi-Status",
        301 => "Moved Permanently",
        401 => "Unauthorized",
        404 => "Not Found",
        429 => "Too Many Requests",
        _ => "OK",
    };
    let mut out = format!(
        "HTTP/1.1 {} {reason}\r\nConnection: close\r\n",
        route.status
    );
    let mut has_len = false;
    for (k, v) in &route.headers {
        if k.eq_ignore_ascii_case("content-length") {
            has_len = true;
        }
        out.push_str(&format!("{k}: {v}\r\n"));
    }
    if !has_len {
        out.push_str(&format!("Content-Length: {}\r\n", route.body.len()));
    }
    out.push_str("\r\n");
    stream.write_all(out.as_bytes())?;
    stream.write_all(&route.body)?;
    stream.flush()
}
