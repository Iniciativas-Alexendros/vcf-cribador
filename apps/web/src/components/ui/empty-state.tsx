import type { ReactNode } from "react";
import styles from "@/styles/states.module.css";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  centered?: boolean;
};

export function EmptyState({
  title,
  description,
  action,
  icon,
  centered = false,
}: Props) {
  return (
    <div className={`${styles.state} ${centered ? styles.stateCenter : ""}`}>
      {icon}
      <h2 className={styles.stateTitle}>{title}</h2>
      {description ? <p className={styles.stateBody}>{description}</p> : null}
      {action}
    </div>
  );
}
