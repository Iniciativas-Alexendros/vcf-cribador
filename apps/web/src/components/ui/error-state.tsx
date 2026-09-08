import type { ReactNode } from "react";
import styles from "@/styles/states.module.css";
import { Callout } from "./callout";

type Props = {
  title?: string;
  message: string;
  action?: ReactNode;
};

export function ErrorState({
  title = "No se pudo completar la operación",
  message,
  action,
}: Props) {
  return (
    <div className={styles.state} role="alert" aria-live="assertive">
      <Callout variant="danger" title={title} icon="circle-exclamation">
        {message}
      </Callout>
      {action}
    </div>
  );
}
