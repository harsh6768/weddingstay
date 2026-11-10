// Hand-drawn wedding ornaments for the guest pages: a marigold toran (door garland) and gold dividers.

const MARIGOLD = ['#E8891A', '#F2A82A', '#D9701A']

function Marigold({ x, y, r, shade }: { x: number; y: number; r: number; shade: number }) {
  const petals = Array.from({ length: 10 }, (_, i) => (i * Math.PI * 2) / 10)
  return (
    <g>
      {petals.map((a, i) => (
        <circle key={i} cx={x + Math.cos(a) * r * 0.55} cy={y + Math.sin(a) * r * 0.55} r={r * 0.55} fill={MARIGOLD[(i + shade) % 3]} />
      ))}
      <circle cx={x} cy={y} r={r * 0.55} fill="#F6B940" />
      <circle cx={x} cy={y} r={r * 0.22} fill="#B85A0E" opacity="0.55" />
    </g>
  )
}

function Leaf({ x, y, rot }: { x: number; y: number; rot: number }) {
  return (
    <path d="M0 0 C 7 8, 7 22, 0 32 C -7 22, -7 8, 0 0 Z" transform={`translate(${x} ${y}) rotate(${rot})`} fill="#3F7A3A" stroke="#2D5E2A" strokeWidth="0.8" />
  )
}

/** A garland of marigold swags with mango leaves, spanning the top of the page. */
export function Toran({ swags = 4 }: { swags?: number }) {
  const W = 400
  const sw = W / swags
  const flowers: { x: number; y: number; r: number }[] = []
  for (let s = 0; s < swags; s++) {
    const x0 = s * sw
    for (let k = 0; k <= 9; k++) {
      const t = k / 9
      flowers.push({ x: x0 + t * sw, y: 10 + Math.sin(Math.PI * t) * 26, r: 6.2 })
    }
  }
  return (
    <svg viewBox={`0 0 ${W} 92`} className="block w-full h-auto" aria-hidden="true" preserveAspectRatio="xMidYMin slice">
      {/* mango leaves hanging between the swags */}
      {Array.from({ length: swags + 1 }, (_, s) => (
        <g key={s}>
          <Leaf x={s * sw - 6} y={12} rot={18} />
          <Leaf x={s * sw} y={14} rot={0} />
          <Leaf x={s * sw + 6} y={12} rot={-18} />
          {/* hanging string of flowers ending in a bell */}
          <line x1={s * sw} y1={14} x2={s * sw} y2={62} stroke="#B2861C" strokeWidth="1" />
          <Marigold x={s * sw} y={52} r={5} shade={s} />
          <path d={`M${s * sw - 4} 62 h8 l-1.5 8 h-5 z`} fill="#C9A13B" />
        </g>
      ))}
      {flowers.map((f, i) => <Marigold key={i} {...f} shade={i} />)}
    </svg>
  )
}

/** Small gold divider: two rules and a lotus-like knot. */
export function GoldDivider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 24" className={className ?? 'mx-auto h-6 w-[200px]'} aria-hidden="true">
      <path d="M8 12 H92" stroke="rgb(var(--gold))" strokeWidth="1" />
      <path d="M148 12 H232" stroke="rgb(var(--gold))" strokeWidth="1" />
      <g fill="none" stroke="rgb(var(--gold))" strokeWidth="1.2">
        <path d="M120 3 C 128 9, 128 15, 120 21 C 112 15, 112 9, 120 3 Z" fill="rgb(var(--gold) / 0.18)" />
        <path d="M120 12 C 110 4, 100 6, 98 12 C 100 18, 110 20, 120 12" />
        <path d="M120 12 C 130 4, 140 6, 142 12 C 140 18, 130 20, 120 12" />
      </g>
      <circle cx="94" cy="12" r="1.6" fill="rgb(var(--gold))" />
      <circle cx="146" cy="12" r="1.6" fill="rgb(var(--gold))" />
    </svg>
  )
}

/** Faint mandala watermark behind the invitation header. */
export function Mandala({ className }: { className?: string }) {
  const rings = [
    { n: 12, r: 70, pr: 18 },
    { n: 16, r: 108, pr: 14 },
    { n: 24, r: 140, pr: 9 },
  ]
  return (
    <svg viewBox="-160 -160 320 320" className={className} aria-hidden="true">
      <g fill="none" stroke="rgb(var(--gold))" strokeWidth="0.9">
        <circle r="40" />
        <circle r="150" />
        {rings.map((ring) =>
          Array.from({ length: ring.n }, (_, i) => {
            const a = (i * 360) / ring.n
            return <ellipse key={`${ring.r}-${i}`} cx="0" cy={-ring.r} rx={ring.pr * 0.5} ry={ring.pr} transform={`rotate(${a})`} />
          }),
        )}
      </g>
    </svg>
  )
}
