type EventItem = {
  id: string;
  title: string;
  detail?: string;
  time?: string;
};

type Props = {
  events: EventItem[];
};

export function JobTimeline({ events }: Props) {
  if (events.length === 0) {
    return <p className="zed-muted">Sin eventos registrados.</p>;
  }
  return (
    <ol
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        borderLeft: "2px solid var(--zed-border-subtle)",
      }}
    >
      {events.map((ev) => (
        <li
          key={ev.id}
          style={{
            padding: "0.75rem 0 0.75rem 1rem",
            position: "relative",
          }}
        >
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: "-0.4rem",
              top: "1rem",
              width: "0.65rem",
              height: "0.65rem",
              borderRadius: "50%",
              background: "var(--zed-accent)",
            }}
          />
          <div style={{ fontWeight: 600 }}>{ev.title}</div>
          {ev.detail ? <p className="zed-muted" style={{ margin: "0.2rem 0" }}>{ev.detail}</p> : null}
          {ev.time ? <p className="zed-mono zed-muted" style={{ margin: 0 }}>{ev.time}</p> : null}
        </li>
      ))}
    </ol>
  );
}
