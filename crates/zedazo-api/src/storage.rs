use std::fs;
use std::path::{Path, PathBuf};

use anyhow::{bail, Context};
use sha2::{Digest, Sha256};

#[derive(Clone)]
pub struct Storage {
    pub root: PathBuf,
}

impl Storage {
    pub fn new(root: PathBuf) -> anyhow::Result<Self> {
        fs::create_dir_all(root.join("jobs"))?;
        fs::create_dir_all(root.join("tmp"))?;
        fs::create_dir_all(root.join("uploads"))?;
        Ok(Self { root })
    }

    pub fn upload_path(&self, upload_id: &str) -> PathBuf {
        self.root.join("uploads").join(upload_id)
    }

    pub fn job_dir(&self, job_id: &str) -> PathBuf {
        self.root.join("jobs").join(job_id)
    }

    pub fn ensure_job_dir(&self, job_id: &str) -> anyhow::Result<PathBuf> {
        let d = self.job_dir(job_id);
        fs::create_dir_all(&d)?;
        Ok(d)
    }

    pub fn write_upload_stream(
        &self,
        upload_id: &str,
        mut reader: impl std::io::Read,
        max_bytes: usize,
    ) -> anyhow::Result<(PathBuf, u64, String)> {
        let path = self.upload_path(upload_id);
        if path.exists() {
            bail!("upload_id ya existe");
        }
        let mut file = fs::File::create(&path)?;
        let mut hasher = Sha256::new();
        let mut buf = [0u8; 64 * 1024];
        let mut total: u64 = 0;
        loop {
            let n = reader.read(&mut buf)?;
            if n == 0 {
                break;
            }
            total += n as u64;
            if total as usize > max_bytes {
                drop(file);
                let _ = fs::remove_file(&path);
                bail!("upload excede límite");
            }
            hasher.update(&buf[..n]);
            use std::io::Write;
            file.write_all(&buf[..n])?;
        }
        let sha = hex::encode(hasher.finalize());
        Ok((path, total, sha))
    }

    pub fn delete_job_dir(&self, job_id: &str) -> anyhow::Result<()> {
        let d = self.job_dir(job_id);
        if d.exists() {
            fs::remove_dir_all(&d).with_context(|| format!("borrar {}", d.display()))?;
        }
        Ok(())
    }

    pub fn sanitize_name(name: &str) -> String {
        name.chars()
            .map(|c| {
                if c.is_ascii_alphanumeric() || c == '.' || c == '-' || c == '_' {
                    c
                } else {
                    '_'
                }
            })
            .take(200)
            .collect()
    }

    pub fn assert_under_root(&self, path: &Path) -> anyhow::Result<()> {
        let canon_root = self
            .root
            .canonicalize()
            .unwrap_or_else(|_| self.root.clone());
        let canon = path.canonicalize().unwrap_or_else(|_| path.to_path_buf());
        if !canon.starts_with(&canon_root) {
            bail!("ruta fuera del data dir");
        }
        Ok(())
    }
}
