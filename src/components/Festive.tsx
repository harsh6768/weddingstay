import { useEffect, useRef, type CSSProperties } from 'react'

// Festive details for the home page: diyas, falling marigold petals, a jharokha arch, scalloped section
// edges, the wedding-functions ribbon and a mehendi vine that draws itself as you scroll.

/** A clay diya with a flickering flame. */
export function Diya({ className, delay = 0, style }: { className?: string; delay?: number; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden="true">
      <defs>
        <radialGradient id="diya-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD27A" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFB040" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="diya-clay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C8642A" />
          <stop offset="100%" stopColor="#8A3A16" />
        </linearGradient>
        <linearGradient id="diya-flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#E8590C" />
          <stop offset="55%" stopColor="#FFB020" />
          <stop offset="100%" stopColor="#FFF3C4" />
        </linearGradient>
      </defs>
      <circle className="diya-glow" cx="32" cy="24" r="22" fill="url(#diya-glow)" style={{ animationDelay: `${delay}ms` }} />
      <g className="diya-flame" style={{ animationDelay: `${delay}ms` }}>
        <path d="M32 8 C 37 16, 38 22, 32 30 C 26 22, 27 16, 32 8 Z" fill="url(#diya-flame)" />
        <path d="M32 18 C 34 22, 34 25, 32 29 C 30 25, 30 22, 32 18 Z" fill="#FFF8E0" />
      </g>
      <path d="M6 34 C 10 50, 22 56, 32 56 C 42 56, 54 50, 58 34 C 50 38, 40 40, 32 40 C 24 40, 14 38, 6 34 Z" fill="url(#diya-clay)" />
      <path d="M6 34 C 14 38, 24 40, 32 40 C 40 40, 50 38, 58 34" fill="none" stroke="#E9A04A" strokeWidth="1.6" />
      <path d="M14 45 q 4 3 8 0 M 28 48 q 4 3 8 0 M 42 45 q 4 3 8 0" fill="none" stroke="#F2C27A" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

/** One marigold petal. */
function Petal({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 20 28" className="h-full w-full" aria-hidden="true">
      <path d="M10 1 C 17 6, 19 16, 10 27 C 1 16, 3 6, 10 1 Z" fill={color} />
      <path d="M10 4 L10 24" stroke="rgb(0 0 0 / 0.12)" strokeWidth="1" />
    </svg>
  )
}

// Fixed positions so the page renders the same every time: [left %, size px, duration s, delay s, colour]
const PETALS: [number, number, number, number, string][] = [
  [4, 14, 13, 0, '#E8891A'], [12, 10, 16, 4, '#F2A82A'], [20, 16, 12, 8, '#D9701A'], [29, 11, 15, 2, '#C2185B'],
  [37, 13, 14, 10, '#F2A82A'], [46, 9, 17, 6, '#E8891A'], [54, 15, 13, 1, '#D9701A'], [62, 10, 16, 9, '#F2A82A'],
  [70, 14, 12, 5, '#C2185B'], [78, 11, 15, 12, '#E8891A'], [86, 16, 14, 3, '#F2A82A'], [94, 10, 13, 7, '#D9701A'],
]

/** Marigold and rose petals drifting down through a section. */
export function Petals({ className = '' }: { className?: string }) {
  return (
    <div className={`petals pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {PETALS.map(([left, size, dur, delay, color], i) => (
        <span key={i} className="petal" style={{ left: `${left}%`, width: size, height: size * 1.4, animationDuration: `${dur}s, ${dur / 3.2}s`, animationDelay: `-${delay}s, -${delay}s` }}>
          <Petal color={color} />
        </span>
      ))}
    </div>
  )
}

/** A Mughal jharokha arch in gold line, used to frame the hero phone. */
export function Jharokha({ className }: { className?: string }) {
  const arch = 'M20 600 V250 C20 160 80 120 120 100 C150 85 170 60 180 20 C190 60 210 85 240 100 C280 120 340 160 340 250 V600'
  return (
    <svg viewBox="0 0 360 620" className={className} aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id="jh-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--gold))" stopOpacity="0.95" />
          <stop offset="100%" stopColor="rgb(var(--gold))" stopOpacity="0.25" />
        </linearGradient>
        <radialGradient id="jh-glow" cx="50%" cy="38%" r="60%">
          <stop offset="0%" stopColor="rgb(var(--marigold))" stopOpacity="0.28" />
          <stop offset="100%" stopColor="rgb(var(--marigold))" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={`${arch} Z`} fill="url(#jh-glow)" />
      <path className="draw" d={arch} fill="none" stroke="url(#jh-gold)" strokeWidth="2" style={{ ['--len' as string]: 1500 }} />
      <path className="draw" d={arch} transform="translate(180 330) scale(0.93) translate(-180 -330)" fill="none" stroke="url(#jh-gold)" strokeWidth="0.8" strokeDasharray="2 6" style={{ ['--len' as string]: 1500, animationDelay: '300ms' }} />
      {/* finial */}
      <g fill="rgb(var(--gold))">
        <circle cx="180" cy="12" r="5" />
        <path d="M180 0 l3 6 h-6 z" />
      </g>
    </svg>
  )
}

/**
 * A row of small arches (like a palace colonnade edge) that joins two sections.
 * `fill` is the colour of the section the arches belong to; flip for the bottom edge.
 */
export function ScallopEdge({ fill, flip, className = '' }: { fill: string; flip?: boolean; className?: string }) {
  return (
    <div className={`relative h-[22px] md:h-[30px] overflow-hidden ${className}`} aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 1200 30" style={{ transform: flip ? 'scaleY(-1)' : undefined }}>
        <defs>
          <pattern id={`scallop-${flip ? 'b' : 't'}`} width="40" height="30" patternUnits="userSpaceOnUse">
            <path d="M0 30 V18 C0 8 8 2 14 1 C17 0.5 19 -1 20 -3 C21 -1 23 0.5 26 1 C32 2 40 8 40 18 V30 Z" fill={fill} />
          </pattern>
        </defs>
        <rect width="1200" height="30" fill={`url(#scallop-${flip ? 'b' : 't'})`} />
      </svg>
    </div>
  )
}

const FUNCTIONS = ['Roka', 'Mehendi', 'Haldi', 'Sangeet', 'Baraat', 'Pheras', 'Vidaai', 'Reception']

/** The wedding, function by function, scrolling past like a festive banner. */
export function FunctionsRibbon() {
  const row = (hidden?: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {FUNCTIONS.map((f) => (
        <span key={f} className="flex items-center">
          <span className="px-6 md:px-9 font-display italic text-[30px] md:text-[44px] font-medium whitespace-nowrap">{f}</span>
          <Bud />
        </span>
      ))}
    </div>
  )
  return (
    <div className="ribbon group relative overflow-hidden py-5 md:py-7" role="region" aria-label="Every function, from roka to reception">
      <div className="marquee flex w-max">{row()}{row(true)}</div>
    </div>
  )
}

function Bud() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 md:h-6 md:w-6 shrink-0" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx="12" cy="5.5" rx="3" ry="5" transform={`rotate(${i * 45} 12 12)`} fill={i % 2 ? '#F2A82A' : '#E8891A'} />)}
      <circle cx="12" cy="12" r="3.2" fill="#B85A0E" />
    </svg>
  )
}

/**
 * A mehendi vine with paisleys that draws itself as its section scrolls through the viewport.
 * Static (fully drawn) when the visitor prefers reduced motion.
 */
export function MehndiVine({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null)
  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    const paths = Array.from(svg.querySelectorAll<SVGPathElement>('path[data-draw]'))
    const lens = paths.map((p) => p.getTotalLength())
    paths.forEach((p, i) => { p.style.strokeDasharray = `${lens[i]}`; p.style.strokeDashoffset = `${lens[i]}` })
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { paths.forEach((p) => { p.style.strokeDashoffset = '0' }); return }
    let raf = 0
    let best = 0 // only ever draws forward, so scrolling back up doesn't erase it
    const update = () => {
      raf = 0
      const r = svg.getBoundingClientRect()
      const vh = window.innerHeight
      const t = best = Math.max(best, Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.6))))
      paths.forEach((p, i) => {
        const start = Number(p.dataset.draw)
        const local = Math.min(1, Math.max(0, (t - start) / (1 - start)))
        p.style.strokeDashoffset = `${lens[i] * (1 - local)}`
      })
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])
  const stroke = { fill: 'none', stroke: 'rgb(var(--plum))', strokeWidth: 1.6, strokeLinecap: 'round' as const }
  return (
    <svg ref={ref} viewBox="0 0 1200 90" className={className} aria-hidden="true">
      <path data-draw="0" {...stroke} d="M0 50 C 100 10, 180 90, 300 48 S 480 8, 600 48 S 780 90, 900 48 S 1100 10, 1200 50" />
      {/* paisleys at each step */}
      {[200, 600, 1000].map((x, i) => (
        <g key={x}>
          {/* paisley: a teardrop that curls into a spiral */}
          <path data-draw={String(0.12 + i * 0.25)} {...stroke} d={`M${x} 60 C ${x - 26} 60, ${x - 30} 26, ${x - 6} 16 C ${x + 14} 9, ${x + 24} 26, ${x + 12} 36 C ${x + 4} 43, ${x - 8} 36, ${x - 3} 28 C ${x + 1} 23, ${x + 8} 26, ${x + 6} 31`} />
          <path data-draw={String(0.18 + i * 0.25)} {...stroke} strokeWidth={1.1} d={`M${x} 60 C ${x + 18} 56, ${x + 30} 44, ${x + 26} 30`} />
          <path data-draw={String(0.2 + i * 0.25)} {...stroke} strokeWidth={1.1} d={`M${x - 46} 58 q 12 -16 26 -4 M${x + 46} 58 q -12 -16 -26 -4`} />
        </g>
      ))}
      {/* small leaves along the vine */}
      {[60, 300, 400, 480, 720, 800, 900, 1140].map((x, i) => (
        <path key={x} data-draw={String(Math.min(0.9, x / 1300))} {...stroke} strokeWidth={1.1} d={`M${x} ${i % 2 ? 52 : 44} q 8 ${i % 2 ? 14 : -14} 18 ${i % 2 ? 4 : -4}`} />
      ))}
    </svg>
  )
}
