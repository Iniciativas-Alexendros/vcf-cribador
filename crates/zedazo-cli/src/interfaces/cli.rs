//! CLI con clap derive.

use clap::{Parser, Subcommand};
use std::path::PathBuf;

#[derive(Parser)]
#[command(
    name = "zedazo",
    version,
    about = "Zedazo: criba, normaliza y clasifica contactos VCF vCard 4.0/3.0 (Proton, Google, Apple)"
)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// Protocolo completo: cribar → normalizar → clasificar → deduplicar
    Cribar {
        /// Archivo VCF de entrada
        input: PathBuf,

        /// Archivo VCF de salida (defecto: <input>_zedazo.vcf)
        #[arg(short = 'o', long)]
        output: Option<PathBuf>,

        /// Archivo de auditoría TSV (defecto: audit.tsv)
        #[arg(short = 'a', long)]
        audit: Option<PathBuf>,

        /// Configuración TOML con reglas personalizadas
        #[arg(short = 'c', long)]
        config: Option<PathBuf>,

        /// Forzar origen (auto|proton|google|apple)
        #[arg(short = 's', long, default_value = "auto")]
        source: String,

        /// Modo dry-run: analiza sin escribir salida
        #[arg(long)]
        dry_run: bool,

        /// Modo estricto: falla en invariantes críticas I1, I2, I3
        #[arg(long)]
        strict: bool,
    },

    /// Solo audita: analiza el VCF sin modificarlo
    Audit {
        input: PathBuf,

        /// Archivo de auditoría TSV (defecto: audit.tsv)
        #[arg(short = 'o', long)]
        output: Option<PathBuf>,

        /// Configuración TOML
        #[arg(short = 'c', long)]
        config: Option<PathBuf>,
    },

    /// Muestra estadísticas de un VCF (cribado o no)
    Stats {
        input: PathBuf,

        /// Formato: text, json, markdown
        #[arg(short = 'f', long, default_value = "text")]
        format: String,
    },

    /// Exporta un VCF cribado a CSV o JSON
    Export {
        input: PathBuf,

        #[arg(short = 'o', long)]
        output: PathBuf,

        /// Formato: csv, json
        #[arg(short = 'f', long, default_value = "csv")]
        format: String,
    },

    /// Genera script de autocompletado para shell
    Completions {
        /// Shell: bash, zsh, fish
        #[arg(value_enum)]
        shell: clap_complete::Shell,
    },

    /// CardDAV: descubrimiento y pull de solo lectura (ADR-0018; sin GUI)
    Carddav {
        #[command(subcommand)]
        action: CarddavAction,
    },
}

/// Subcomandos CardDAV (primer slice: list + pull).
#[derive(Subcommand)]
pub enum CarddavAction {
    /// Lista addressbooks (descubrimiento RFC 6764 / URL explícita)
    List {
        #[command(flatten)]
        opts: CarddavOpts,
    },
    /// Descarga vCards a un fichero VCF local (GET; sin PUT/DELETE)
    Pull {
        #[command(flatten)]
        opts: CarddavOpts,
        /// Fichero VCF de salida
        #[arg(short = 'o', long)]
        output: PathBuf,
    },
}

/// Opciones comunes CardDAV. La contraseña solo vía env/TOML.
#[derive(clap::Args, Debug, Clone)]
pub struct CarddavOpts {
    /// URL base del servidor (env: ZEDAZO_CARDDAV_URL)
    #[arg(long)]
    pub url: Option<String>,

    /// Usuario HTTP Basic (env: ZEDAZO_CARDDAV_USERNAME)
    #[arg(long)]
    pub username: Option<String>,

    /// URL explícita del addressbook (env: ZEDAZO_CARDDAV_ADDRESSBOOK)
    #[arg(long)]
    pub addressbook: Option<String>,

    /// TOML con sección `[carddav]` (además de reglas `[zedazo]` si coexisten)
    #[arg(short = 'c', long)]
    pub config: Option<PathBuf>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use clap::CommandFactory;

    #[test]
    fn carddav_list_y_pull_existen() {
        let cmd = Cli::command();
        let carddav = cmd.find_subcommand("carddav").expect("subcomando carddav");
        let names: Vec<_> = carddav.get_subcommands().map(|s| s.get_name()).collect();
        assert!(names.contains(&"list"));
        assert!(names.contains(&"pull"));
        assert!(!names.contains(&"push"));
    }
}
