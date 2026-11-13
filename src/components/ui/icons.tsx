export function Arrow({ color = "currentColor", className }: { color?: string; className?: string }) {
  return (
    <svg width="22" height="12" viewBox="0 0 22 12" aria-hidden="true" className={className}>
      <path d="M0 6h20 M15 1l5 5-5 5" fill="none" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

export function Back({ color = "currentColor" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 4l-8 8 8 8" fill="none" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

export function Satchel({ color = "currentColor", size = 22 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3.5 9h17v10.5H3.5z M8.5 9V6.5h7V9 M3.5 13h17 M11 13v2.5h2V13"
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Headphones({ color = "currentColor" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 15v-3a8 8 0 0 1 16 0v3 M4 15h3v5H4z M17 15h3v5h-3z"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Speaker({ off, color = "currentColor" }: { off: boolean; color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      {off ? (
        <path d="M15.5 9.5l5 5 M20.5 9.5l-5 5" stroke={color} strokeWidth="1.5" />
      ) : (
        <path d="M15.5 9a4.5 4.5 0 0 1 0 6 M18 7a7.5 7.5 0 0 1 0 10" fill="none" stroke={color} strokeWidth="1.5" />
      )}
    </svg>
  );
}

export function Bell({ color = "currentColor" }: { color?: string }) {
  return (
    <path
      d="M16 27h12 M17.5 27v-5a4.5 4.5 0 0 1 9 0v5 M22 15.5v2 M21 29.5h2"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  );
}
