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

/** Ivory Minimal: initials in a thin double ring. */
export function Monogram({ a, b, className }: { a: string; b: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className ?? 'mx-auto h-[92px] w-[92px]'} aria-hidden="true">
      <circle cx="60" cy="60" r="56" fill="none" stroke="rgb(var(--ink))" strokeWidth="0.8" />
      <circle cx="60" cy="60" r="50" fill="none" stroke="rgb(var(--ink))" strokeWidth="0.5" opacity="0.5" />
      <text x="60" y="68" textAnchor="middle" fontFamily='"Cormorant Garamond", serif' fontSize="30" fill="rgb(var(--ink))" letterSpacing="2">{a}<tspan fontStyle="italic" fontSize="22" dx="2" dy="-2" fill="rgb(var(--muted))">&amp;</tspan><tspan dx="2" dy="2">{b}</tspan></text>
    </svg>
  )
}

/** Midnight Deco: a gold sunburst fan with stepped arcs. */
export function DecoFan({ className }: { className?: string }) {
  const rays = Array.from({ length: 19 }, (_, i) => 180 + (i * 180) / 18)
  return (
    <svg viewBox="0 0 240 130" className={className ?? 'mx-auto h-[110px] w-[220px]'} aria-hidden="true">
      <g stroke="rgb(var(--gold))" fill="none">
        {rays.map((a, i) => {
          const r = (a * Math.PI) / 180
          const inner = 34, outer = i % 2 ? 96 : 112
          return <line key={i} x1={120 + Math.cos(r) * inner} y1={120 + Math.sin(r) * inner} x2={120 + Math.cos(r) * outer} y2={120 + Math.sin(r) * outer} strokeWidth={i % 2 ? 0.6 : 1} />
        })}
        <path d="M86 120 A34 34 0 0 1 154 120" strokeWidth="1.4" />
        <path d="M74 120 A46 46 0 0 1 166 120" strokeWidth="0.6" />
        <path d="M4 120 H236" strokeWidth="1" />
        <path d="M20 126 H220" strokeWidth="0.5" />
      </g>
      <circle cx="120" cy="120" r="5" fill="rgb(var(--gold))" />
    </svg>
  )
}

/** Sage Garden: a hand-drawn leafy sprig, mirrored. */
export function Sprig({ className, flip }: { className?: string; flip?: boolean }) {
  const leaves = [[18, 40, -40], [34, 30, -30], [50, 24, -20], [66, 20, -10], [82, 18, 0], [26, 52, 140], [44, 42, 150], [62, 36, 160], [80, 32, 170]]
  return (
    <svg viewBox="0 0 110 70" className={className ?? 'h-[60px] w-[96px]'} style={flip ? { transform: 'scaleX(-1)' } : undefined} aria-hidden="true">
      <path d="M6 60 C 30 40, 60 26, 104 22" fill="none" stroke="rgb(var(--plum))" strokeWidth="1.2" strokeLinecap="round" />
      {leaves.map(([x, y, rot], i) => (
        <path key={i} d="M0 0 C 5 -6, 15 -6, 20 0 C 15 6, 5 6, 0 0 Z" transform={`translate(${x} ${y}) rotate(${rot})`} fill="rgb(var(--plum) / 0.16)" stroke="rgb(var(--plum))" strokeWidth="0.9" />
      ))}
      <circle cx="104" cy="22" r="2.4" fill="rgb(var(--gold))" />
    </svg>
  )
}

/** Rani Pop: soft colour blobs and confetti behind the header. */
export function PopConfetti({ className }: { className?: string }) {
  const bits: [number, number, number, string][] = [[24, 30, 20, 'plum'], [300, 24, -30, 'gold'], [60, 150, 40, 'gold'], [280, 140, 10, 'plum'], [180, 14, 60, 'info'], [330, 90, -50, 'info'], [12, 96, 15, 'good'], [230, 190, 70, 'plum']]
  return (
    <svg viewBox="0 0 340 220" preserveAspectRatio="none" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="popA"><stop offset="0" stopColor="rgb(255 70 150)" stopOpacity="0.35" /><stop offset="1" stopColor="rgb(255 70 150)" stopOpacity="0" /></radialGradient>
        <radialGradient id="popB"><stop offset="0" stopColor="rgb(255 160 40)" stopOpacity="0.35" /><stop offset="1" stopColor="rgb(255 160 40)" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="70" cy="70" r="110" fill="url(#popA)" />
      <circle cx="280" cy="120" r="110" fill="url(#popB)" />
      {bits.map(([x, y, r, c], i) => <rect key={i} x={x} y={y} width="12" height="5" rx="2.5" transform={`rotate(${r} ${x + 6} ${y + 2.5})`} fill={`rgb(var(--${c}))`} />)}
      <circle cx="120" cy="40" r="3.5" fill="rgb(var(--gold))" /><circle cx="250" cy="60" r="3" fill="rgb(var(--plum))" /><circle cx="40" cy="190" r="3" fill="rgb(var(--info))" />
    </svg>
  )
}

/** Desert Arch: a scalloped jharokha arch that frames the header. */
export function Arch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 260" preserveAspectRatio="none" className={className} aria-hidden="true">
      <g fill="none" stroke="rgb(var(--gold))">
        <path d="M14 258 V120 C 14 60, 70 22, 150 6 C 230 22, 286 60, 286 120 V258" strokeWidth="1.6" />
        <path d="M26 258 V124 C 26 70, 78 36, 150 20 C 222 36, 274 70, 274 124 V258" strokeWidth="0.7" strokeDasharray="2 4" />
      </g>
      <circle cx="150" cy="6" r="4" fill="rgb(var(--plum))" />
    </svg>
  )
}
