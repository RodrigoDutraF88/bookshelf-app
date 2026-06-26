
type Props = {
  percentage: number; // 0–100
  size?: number;      // diameter in px, default 36
  strokeWidth?: number;
};

export function ProgressRing({
  percentage,
  size = 36,
  strokeWidth = 3,
}: Props) {
  const clampedPct = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clampedPct / 100) * circumference;
  const center = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={`${Math.round(clampedPct)}% read`}
      role="img"
    >
      {/* Track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc — starts from top (−90° rotation) */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: "stroke-dashoffset 0.4s cubic-bezier(0.4,0,0.2,1)" }}
      />
      {/* Center percentage text */}
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--color-text-primary)"
        fontSize={size * 0.28}
        fontFamily="var(--font-mono)"
        fontWeight="500"
      >
        {Math.round(clampedPct)}
      </text>
    </svg>
  );
}