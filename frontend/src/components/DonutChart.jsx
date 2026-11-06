export default function DonutChart({ slices, total }) {
  const r = 44;
  const C = 2 * Math.PI * r;
  const gap = slices.length > 1 ? 2 : 0;
  let offset = 0;

  const summary = slices.map((s) => `${s.label} ${s.pct}%`).join(', ');

  return (
    <svg className="donut" viewBox="0 0 120 120" role="img" aria-label={`Distribución de tus ánimos: ${summary}`}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--line)" strokeWidth="20" />
      <g transform="rotate(-90 60 60)">
        {slices.map((s) => {
          const len = (s.count / total) * C;
          const shown = Math.max(len - gap, 0);
          const el = (
            <circle
              key={s.emotion}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="20"
              strokeDasharray={`${shown} ${C - shown}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </g>
      <text x="60" y="59" textAnchor="middle" className="donut-total">{total}</text>
      <text x="60" y="75" textAnchor="middle" className="donut-caption">LECTURAS</text>
    </svg>
  );
}