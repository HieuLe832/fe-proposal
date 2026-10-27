/* Decorative QR (not scannable): deterministic modules seeded from the booking code. */
export function Qr({ seed, size = 170 }: { seed: string; size?: number }) {
  const N = 25
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0), (h & 0xffff) / 0xffff)
  const finder = (x: number, y: number) => [[0, 0], [N - 7, 0], [0, N - 7]].some(([fx, fy]) => x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7)
  const cells: [number, number][] = []
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!finder(x, y) && rnd() > 0.52) cells.push([x, y])
  const eye = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="7" height="7" fill="#0f1220" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="#0f1220" />
    </g>
  )
  return (
    <svg width={size} height={size} viewBox={`0 0 ${N} ${N}`} shapeRendering="crispEdges" role="img" aria-label="QR minh họa">
      <rect width={N} height={N} fill="#fff" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0f1220" />
      ))}
      {eye(0, 0)}
      {eye(N - 7, 0)}
      {eye(0, N - 7)}
    </svg>
  )
}
