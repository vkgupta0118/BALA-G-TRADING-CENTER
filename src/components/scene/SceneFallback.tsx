/**
 * Static isometric illustration (SVG) of bricks, cement bags and steel rods.
 * Used: during lazy-load, when JS is unavailable, on save-data connections,
 * and as the server-rendered markup so there is never an empty hero.
 */
const TICKS = Array.from({ length: 28 }, (_, k) => 6 + k * 10.5);

export function SceneFallback({ label }: { label: string }) {
  return (
    <svg
      className="scene-fallback"
      viewBox="0 0 520 420"
      role="img"
      aria-label={label}
      data-testid="scene-fallback"
      focusable="false"
    >
      <defs>
        <radialGradient id="sf-ground" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#E3B341" stopOpacity="0.25" />
          <stop offset="0.6" stopColor="#E3B341" stopOpacity="0.05" />
          <stop offset="1" stopColor="#E3B341" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="260" cy="330" rx="230" ry="70" fill="url(#sf-ground)" />

      {/* Brick stack (left) */}
      <g>
        {[
          [70, 250],
          [130, 250],
          [190, 250],
          [100, 222],
          [160, 222],
          [70, 194],
          [130, 194],
          [190, 194],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
            <polygon points="0,0 56,0 56,26 0,26" fill="#A8402A" />
            <polygon points="56,0 76,-12 76,14 56,26" fill="#7E2F1B" />
            <polygon points="0,0 20,-12 76,-12 56,0" fill="#CF5A3B" />
          </g>
        ))}
      </g>

      {/* Cement bags (right) */}
      <g>
        {[
          [300, 246, 0],
          [370, 262, 0],
          [332, 206, -4],
        ].map(([x, y, r]) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${r})`}>
            <rect x="0" y="0" width="84" height="36" rx="7" fill="#E7E2D6" />
            <rect x="0" y="13" width="84" height="10" fill="#A16207" />
            <polygon points="84,4 104,-8 104,24 84,36" fill="#BFB8AA" />
            <polygon points="4,0 24,-12 104,-8 84,4" fill="#F7F4EC" />
          </g>
        ))}
      </g>

      {/* Steel rods (front) */}
      <g transform="translate(120 318) rotate(-12)">
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`translate(${i * 6} ${i * 9})`}>
            <rect x="0" y="0" width="300" height="8" rx="2" fill="#4B5663" />
            <rect x="0" y="0" width="300" height="3" rx="1.5" fill="#9AA6B2" />
            <g fill="#ffffff" fillOpacity="0.25">
              {TICKS.map((x) => (
                <rect key={x} x={x} y="1" width="2" height="6" />
              ))}
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
}
