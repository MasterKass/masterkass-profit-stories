export function BrandMark({ size = 38 }: { size?: number }) {
  return (
    <svg className="welcome-logo" viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      {[
        ["16,3 27.3,9.5", "oklch(0.86 0.17 92)"],
        ["27.3,9.5 27.3,22.5", "oklch(0.85 0.18 120)"],
        ["27.3,22.5 16,29", "oklch(0.83 0.18 145)"],
        ["16,29 4.7,22.5", "oklch(0.8 0.13 210)"],
        ["4.7,22.5 4.7,9.5", "oklch(0.74 0.17 50)"],
        ["4.7,9.5 16,3", "oklch(0.8 0.17 72)"],
      ].map(([pts, color]) => (
        <polygon key={pts} points={`16,16 ${pts}`} fill={color} />
      ))}
      <path d="M16 3 L27.3 9.5 L27.3 22.5 L16 29 L4.7 22.5 L4.7 9.5 Z M16 3 L16 29 M4.7 9.5 L27.3 22.5 M27.3 9.5 L4.7 22.5" fill="none" stroke="oklch(1 0 0)" strokeWidth="0.3" strokeLinejoin="round" />
    </svg>
  );
}
