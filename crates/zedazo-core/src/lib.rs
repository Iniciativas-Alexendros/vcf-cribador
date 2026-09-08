pub mod application;
pub mod domain;
pub mod error;
pub mod infrastructure;

// Re-export frecuente para consumidores (CLI, API, tests)
pub use error::CribaError;
