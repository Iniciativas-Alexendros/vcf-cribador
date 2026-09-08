//! Equivalencia process::run vs cribar::execute (paridad CLI/API core).

use std::collections::BTreeSet;
use std::path::PathBuf;
use std::sync::Arc;

use tempfile::tempdir;
use zedazo_core::application::cribar;
use zedazo_core::application::process::{
    self, ArtifactKind, JobId, NullProgress, ProcessRequest, RulesConfigSource,
};
use zedazo_core::domain::screening::ScreeningDecision;

fn fixture(name: &str) -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("tests")
        .join("fixtures")
        .join(name)
}

#[test]
fn equivalence_sample_contacts_counts() {
    let input = fixture("sample-contacts.vcf");
    let (_stats_cli, contacts_cli) =
        cribar::execute(&input, None, None, None, "auto", true, false).unwrap();

    let dir = tempdir().unwrap();
    let req = ProcessRequest {
        job_id: JobId("test".into()),
        input_path: input,
        working_directory: dir.path().to_path_buf(),
        config: RulesConfigSource::BuiltIn,
        requested_artifacts: BTreeSet::from([ArtifactKind::StatsJson]),
        source_override: "auto".into(),
        dry_run: true,
        strict: false,
        cancellation: Default::default(),
        progress: Arc::new(NullProgress),
    };
    let result = process::run(&req).unwrap();

    let count = |c: &[zedazo_core::domain::contact::Contact],
                 pred: fn(&ScreeningDecision) -> bool| {
        c.iter().filter(|x| pred(&x.decision)).count()
    };

    assert_eq!(
        count(&contacts_cli, |d| matches!(d, ScreeningDecision::Conserved)),
        result.summary.retained
    );
    assert_eq!(
        count(&contacts_cli, |d| matches!(
            d,
            ScreeningDecision::NeedsReview(_)
        )),
        result.summary.needs_review
    );
    assert_eq!(contacts_cli.len(), result.contacts.len());
}
