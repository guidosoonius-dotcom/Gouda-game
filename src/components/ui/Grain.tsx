/** Animated film grain overlay for scene photographs. */
export function Grain({ id, opacity = 0.22 }: { id: string; opacity?: number }) {
  return (
    <svg
      className="anim-grain pointer-events-none absolute -left-5 -top-5 h-[calc(100%+40px)] w-[calc(100%+40px)] mix-blend-overlay"
      style={{ opacity }}
      aria-hidden="true"
    >
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
}

/** Static paper fibre texture for parchment and newsprint. */
export function PaperTexture({ id }: { id: string }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-50 mix-blend-multiply" aria-hidden="true">
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" />
        <feColorMatrix type="matrix" values="0 0 0 0 .55  0 0 0 0 .5  0 0 0 0 .42  0 0 0 .22 0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
}
