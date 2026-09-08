import { Card } from "./card";

type Props = {
  label: string;
  value: string | number;
  hint?: string;
};

export function StatCard({ label, value, hint }: Props) {
  return (
    <Card variant="metric">
      <p className="zed-label" style={{ margin: 0 }}>
        {label}
      </p>
      <p className="zed-stat-value" style={{ margin: "0.35rem 0" }}>
        {value}
      </p>
      {hint ? (
        <p className="zed-muted" style={{ margin: 0, fontSize: "0.875rem" }}>
          {hint}
        </p>
      ) : null}
    </Card>
  );
}
