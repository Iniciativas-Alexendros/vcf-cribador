"use client";

import { IconButton } from "@/components/ui/icon-button";
import { Icon } from "@/components/ui/icon";

type Props = {
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
};

export function ContactField({ label, value, mono, copyable }: Props) {
  return (
    <div
      className="zed-row"
      style={{
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "0.4rem 0",
        borderBottom: "1px solid var(--zed-border-subtle)",
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="zed-label" style={{ margin: 0 }}>
          {label}
        </div>
        <div
          className={mono ? "zed-mono" : undefined}
          style={{ overflowWrap: "anywhere" }}
        >
          {value}
        </div>
      </div>
      {copyable ? (
        <IconButton
          label={`Copiar ${label}`}
          onClick={() => void navigator.clipboard.writeText(value)}
        >
          <Icon name="copy" aria-hidden={true} />
        </IconButton>
      ) : null}
    </div>
  );
}
