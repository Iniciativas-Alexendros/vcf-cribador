"use client";

import { Icon } from "@/components/ui/icon";
import { IconButton } from "./icon-button";

export type MetadataItem = {
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
};

type Props = {
  items: MetadataItem[];
};

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    /* ignore */
  }
}

export function MetadataList({ items }: Props) {
  return (
    <dl
      style={{
        display: "grid",
        gap: "0.85rem",
        margin: 0,
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            display: "grid",
            gap: "0.25rem",
            gridTemplateColumns: "minmax(8rem, 12rem) 1fr auto",
            alignItems: "center",
          }}
        >
          <dt className="zed-label" style={{ margin: 0 }}>
            {item.label}
          </dt>
          <dd
            className={item.mono ? "zed-mono zed-truncate" : "zed-truncate"}
            style={{ margin: 0 }}
            title={item.value}
          >
            {item.value}
          </dd>
          {item.copyable ? (
            <IconButton
              label={`Copiar ${item.label}`}
              onClick={() => void copyText(item.value)}
            >
              <Icon name="copy" aria-hidden={true} />
            </IconButton>
          ) : (
            <span />
          )}
        </div>
      ))}
    </dl>
  );
}
