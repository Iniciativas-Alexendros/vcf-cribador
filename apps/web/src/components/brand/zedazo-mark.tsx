type Props = {
  size?: 16 | 20 | 24 | 32 | 48;
  title?: string;
  className?: string;
};

/** Marca vectorial: tres nodos conectados con trazo en Z sutil. */
export function ZedazoMark({ size = 24, title, className }: Props) {
  const label = title ?? "Zedazo";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label={label}
      className={className}
      fill="none"
    >
      <title>{label}</title>
      <path
        d="M8 7h12L10 16h11"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.35"
      />
      <circle cx="8" cy="7" r="3" fill="currentColor" />
      <circle cx="16" cy="16" r="3.25" fill="currentColor" />
      <circle cx="24" cy="25" r="3" fill="currentColor" />
      <path
        d="M10.2 9.2 14.1 14.1M17.9 17.9 21.8 22.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
