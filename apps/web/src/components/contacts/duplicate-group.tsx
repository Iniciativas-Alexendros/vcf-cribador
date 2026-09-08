import { Card } from "@/components/ui/card";
import { DuplicateEvidence } from "./duplicate-evidence";

type Group = {
  canonical_uid: string;
  member_uids: string[];
};

type Props = {
  groups: Group[];
  auditRows?: { cols: string[] }[];
};

export function DuplicateGroup({ groups, auditRows = [] }: Props) {
  if (groups.length === 0) {
    return <p className="zed-muted">Sin grupos de duplicados.</p>;
  }
  return (
    <div className="zed-stack">
      {groups.map((g) => (
        <Card key={g.canonical_uid} variant="document">
          <h3 style={{ marginTop: 0 }}>Contacto canónico</h3>
          <p className="zed-mono" style={{ overflowWrap: "anywhere" }}>
            {g.canonical_uid}
          </p>
          <h3>Miembros</h3>
          <ul>
            {g.member_uids.map((m) => (
              <li key={m} className="zed-mono" style={{ overflowWrap: "anywhere" }}>
                {m}
              </li>
            ))}
          </ul>
          <DuplicateEvidence memberUids={g.member_uids} auditRows={auditRows} />
        </Card>
      ))}
    </div>
  );
}
