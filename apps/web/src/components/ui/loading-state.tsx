import styles from "@/styles/states.module.css";

type Props = {
  label?: string;
  lines?: number;
};

export function LoadingState({
  label = "Cargando…",
  lines = 4,
}: Props) {
  return (
    <div role="status" aria-live="polite" className={styles.state}>
      <div className="zed-row">
        <span className="zed-spinner" aria-hidden />
        <span>{label}</span>
      </div>
      <div className={styles.skeleton} aria-hidden>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={styles.skeletonLine}
            style={{ width: `${70 + ((i * 13) % 30)}%` }}
          />
        ))}
      </div>
    </div>
  );
}
