//! Adaptador CLI → `zedazo-carddav` (solo lectura).

use std::io::{self, Write};
use std::path::PathBuf;

use anyhow::Context;
use zedazo_carddav::config::{load, ConfigOverrides};
use zedazo_carddav::CardDavClient;

use super::cli::{CarddavAction, CarddavOpts};

pub fn run(action: CarddavAction) -> anyhow::Result<()> {
    match action {
        CarddavAction::List { opts } => list(opts),
        CarddavAction::Pull { opts, output } => pull(opts, output),
    }
}

fn client_from_opts(opts: CarddavOpts) -> anyhow::Result<CardDavClient> {
    let config = load(ConfigOverrides {
        url: opts.url,
        username: opts.username,
        password: None,
        addressbook: opts.addressbook,
        config_path: opts.config,
    })
    .context("configuración CardDAV incompleta (ZEDAZO_CARDDAV_* / [carddav] / flags)")?;
    CardDavClient::new(config).context("no se pudo crear el cliente CardDAV")
}

fn list(opts: CarddavOpts) -> anyhow::Result<()> {
    let client = client_from_opts(opts)?;
    let books = client.list_addressbooks()?;
    if books.is_empty() {
        anyhow::bail!("no se encontró ningún addressbook");
    }
    let stdout = io::stdout();
    let mut out = stdout.lock();
    for book in books {
        let name = book.displayname.as_deref().unwrap_or("-");
        writeln!(out, "{}\t{name}", book.url)?;
    }
    Ok(())
}

fn pull(opts: CarddavOpts, output: PathBuf) -> anyhow::Result<()> {
    let client = client_from_opts(opts)?;
    let result = client.pull(None)?;
    let vcf = result.concatenated_vcf();
    if let Some(parent) = output.parent() {
        if !parent.as_os_str().is_empty() {
            std::fs::create_dir_all(parent)?;
        }
    }
    std::fs::write(&output, vcf.as_bytes())?;
    let name = result
        .addressbook
        .displayname
        .as_deref()
        .unwrap_or(result.addressbook.url.as_str());
    eprintln!(
        "Descargados {} vCard(s) de {name} → {}",
        result.cards.len(),
        output.display()
    );
    Ok(())
}
