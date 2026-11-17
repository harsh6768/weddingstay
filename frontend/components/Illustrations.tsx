// Hand-drawn couple illustrations for the artistic RSVP designs. Plain SVG, no external art.

const INK = '#2B2230'

/** A panda bride (flower and bindi) and a koala groom (saffron safa) with a heart between them. */
export function PandaKoala({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 280 170" className={className ?? 'mx-auto h-[150px] w-[250px]'} aria-hidden="true">
      {/* bamboo */}
      <g stroke="#6FA868" strokeWidth="5" strokeLinecap="round">
        <path d="M12 168 V60" /><path d="M268 168 V70" />
      </g>
      <g stroke="#4E8A4A" strokeWidth="1.5"><path d="M8 110 h8" /><path d="M8 80 h8" /><path d="M264 120 h8" /><path d="M264 92 h8" /></g>
      <g fill="#7DB874">
        <path d="M14 70 c 14 -12, 28 -12, 34 -6 c -12 4, -22 8, -34 6 z" /><path d="M14 92 c -10 -12, -10 -24, -4 -30 c 2 12, 4 20, 4 30 z" />
        <path d="M266 80 c -14 -12, -28 -12, -34 -6 c 12 4, 22 8, 34 6 z" /><path d="M266 100 c 10 -12, 10 -24, 4 -30 c -2 12, -4 20, -4 30 z" />
      </g>

      {/* panda */}
      <g transform="translate(88 92)">
        <ellipse cx="0" cy="52" rx="38" ry="30" fill="#fff" stroke={INK} strokeWidth="2" />
        <path d="M-34 40 c -6 14, 0 26, 12 26" fill={INK} /><path d="M22 34 c 18 0, 30 6, 34 14 c -10 4, -24 2, -34 -4 z" fill={INK} />
        <circle cx="-25" cy="-27" r="12" fill={INK} /><circle cx="25" cy="-27" r="12" fill={INK} />
        <circle cx="0" cy="0" r="36" fill="#fff" stroke={INK} strokeWidth="2" />
        <ellipse cx="-13" cy="-2" rx="9" ry="12" transform="rotate(-25 -13 -2)" fill={INK} />
        <ellipse cx="13" cy="-2" rx="9" ry="12" transform="rotate(25 13 -2)" fill={INK} />
        <circle cx="-11" cy="-3" r="3.4" fill="#fff" /><circle cx="15" cy="-3" r="3.4" fill="#fff" />
        <circle cx="-10.4" cy="-3.6" r="1.4" fill={INK} /><circle cx="15.6" cy="-3.6" r="1.4" fill={INK} />
        <ellipse cx="0" cy="12" rx="5" ry="3.6" fill={INK} />
        <path d="M-5 18 q 5 5 10 0" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="-22" cy="12" r="5" fill="#F7A6B8" opacity="0.8" /><circle cx="22" cy="12" r="5" fill="#F7A6B8" opacity="0.8" />
        <circle cx="0" cy="-16" r="2.4" fill="#D7264D" />
        {/* flower behind the ear */}
        <g transform="translate(-30 -34)">{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-6" rx="4" ry="6" transform={`rotate(${a})`} fill="#F2668B" />)}<circle r="3" fill="#FFD25A" /></g>
      </g>

      {/* koala */}
      <g transform="translate(194 94)">
        <ellipse cx="0" cy="50" rx="36" ry="30" fill="#9AA3AE" stroke={INK} strokeWidth="2" />
        <ellipse cx="0" cy="56" rx="20" ry="18" fill="#D9DEE4" />
        <path d="M-26 32 c -20 0, -32 6, -34 14 c 10 4, 24 2, 34 -4 z" fill="#8A94A0" stroke={INK} strokeWidth="1.5" />
        <circle cx="-33" cy="-14" r="18" fill="#9AA3AE" stroke={INK} strokeWidth="2" /><circle cx="-33" cy="-14" r="10" fill="#E8D9DD" />
        <circle cx="33" cy="-14" r="18" fill="#9AA3AE" stroke={INK} strokeWidth="2" /><circle cx="33" cy="-14" r="10" fill="#E8D9DD" />
        <circle cx="0" cy="2" r="34" fill="#A9B2BC" stroke={INK} strokeWidth="2" />
        <circle cx="-13" cy="-2" r="3.6" fill={INK} /><circle cx="13" cy="-2" r="3.6" fill={INK} />
        <circle cx="-12" cy="-3" r="1.2" fill="#fff" /><circle cx="14" cy="-3" r="1.2" fill="#fff" />
        <ellipse cx="0" cy="12" rx="9" ry="12" fill="#3A3340" />
        <ellipse cx="-3" cy="6" rx="2.4" ry="3.4" fill="#fff" opacity="0.35" />
        <circle cx="-22" cy="16" r="5" fill="#F7A6B8" opacity="0.7" /><circle cx="22" cy="16" r="5" fill="#F7A6B8" opacity="0.7" />
        {/* saffron safa with a jewel and plume */}
        <path d="M-30 -18 C -30 -46, 30 -46, 30 -18 C 18 -26, -18 -26, -30 -18 Z" fill="#F39A1E" stroke={INK} strokeWidth="1.8" />
        <path d="M-26 -26 C -10 -34, 10 -34, 26 -26" fill="none" stroke="#C9661A" strokeWidth="2" />
        <path d="M-22 -34 C -8 -40, 8 -40, 22 -34" fill="none" stroke="#C9661A" strokeWidth="2" />
        <circle cx="0" cy="-30" r="4" fill="#D7264D" stroke="#FFD25A" strokeWidth="1.5" />
        <path d="M2 -34 c 6 -10, 14 -14, 20 -12 c -6 4, -12 8, -18 14 z" fill="#FFD25A" stroke={INK} strokeWidth="1" />
      </g>

      {/* heart and sparkles */}
      <path d="M141 70 c -10 -10, -24 -2, -16 12 c 4 6, 12 12, 16 16 c 4 -4, 12 -10, 16 -16 c 8 -14, -6 -22, -16 -12 z" fill="#E8466A" />
      <g fill="#FFC23D"><path d="M140 30 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z" /><path d="M116 48 l1.2 3.6 3.6 1.2 -3.6 1.2 -1.2 3.6 -1.2 -3.6 -3.6 -1.2 3.6 -1.2 z" /><path d="M164 46 l1.2 3.6 3.6 1.2 -3.6 1.2 -1.2 3.6 -1.2 -3.6 -3.6 -1.2 3.6 -1.2 z" /></g>
    </svg>
  )
}

function Parakeet({ x, y, flip, body, wing, tail }: { x: number; y: number; flip?: boolean; body: string; wing: string; tail: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      <path d="M-18 18 C -40 40, -58 64, -66 84 C -52 70, -36 52, -14 30 Z" fill={tail} />
      <path d="M-14 24 C -32 50, -40 72, -42 92 C -32 72, -22 52, -6 32 Z" fill={wing} opacity="0.85" />
      <ellipse cx="0" cy="10" rx="20" ry="27" transform="rotate(-24)" fill={body} />
      <path d="M-14 2 C -20 18, -14 34, 2 36 C -4 26, -6 14, -14 2 Z" fill={wing} />
      <circle cx="10" cy="-18" r="15" fill={body} />
      <path d="M22 -22 C 32 -20, 34 -10, 26 -6 C 26 -12, 24 -16, 20 -16 Z" fill="#E2462E" />
      <circle cx="14" cy="-21" r="3" fill={INK} /><circle cx="15" cy="-22" r="1" fill="#fff" />
      <path d="M-2 -10 C 6 -4, 18 -4, 26 -8" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      <path d="M-4 34 l-3 10 M4 34 l1 10" stroke="#C47A3A" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  )
}

/** Two rose-ringed parakeets on a flowering branch. */
export function LoveBirds({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 280 170" className={className ?? 'mx-auto h-[150px] w-[250px]'} aria-hidden="true">
      <path d="M10 140 C 70 128, 140 132, 270 120" fill="none" stroke="#7A5232" strokeWidth="5" strokeLinecap="round" />
      <g fill="#5E9E6A">
        {[[40, 134, -30], [70, 130, 200], [210, 124, -20], [240, 122, 190], [130, 132, 160]].map(([x, y, r], i) => <path key={i} d="M0 0 C 6 -8, 18 -8, 24 0 C 18 6, 6 6, 0 0 Z" transform={`translate(${x} ${y}) rotate(${r})`} />)}
      </g>
      {[[24, 136], [256, 118], [100, 130]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}>{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-5" rx="3.6" ry="5.4" transform={`rotate(${a})`} fill="#F27FA0" />)}<circle r="2.6" fill="#FFD25A" /></g>)}
      <Parakeet x={104} y={88} body="#48B98A" wing="#2E8E68" tail="#3A7FB8" />
      <Parakeet x={176} y={86} flip body="#4FC3C0" wing="#2B9A98" tail="#7F5FC4" />
      <path d="M140 28 c -8 -8, -20 -2, -13 10 c 3 5, 10 10, 13 13 c 3 -3, 10 -8, 13 -13 c 7 -12, -5 -18, -13 -10 z" fill="#E8466A" />
      <path d="M118 22 c -4 -4, -10 -1, -6.5 5 c 1.5 2.5, 5 5, 6.5 6.5 c 1.5 -1.5, 5 -4, 6.5 -6.5 c 3.5 -6, -2.5 -9, -6.5 -5 z" fill="#F27FA0" />
    </svg>
  )
}

function Elephant({ x, flip, cloth }: { x: number; flip?: boolean; cloth: string }) {
  return (
    <g transform={`translate(${x} 0) scale(${flip ? -1 : 1} 1)`}>
      {/* legs */}
      <g fill="#8E8B9E" stroke={INK} strokeWidth="1.6">
        <rect x="-52" y="112" width="16" height="40" rx="6" /><rect x="-26" y="114" width="16" height="38" rx="6" />
        <rect x="-4" y="112" width="16" height="40" rx="6" /><rect x="18" y="114" width="15" height="38" rx="6" />
      </g>
      <g fill="#F5F0E6"><path d="M-52 150 h16 v2 h-16z M-26 150 h16 v2 h-16z M-4 150 h16 v2 h-16z M18 150 h15 v2 h-15z" /></g>
      <path d="M-60 100 C -66 120, -64 132, -62 140" fill="none" stroke={INK} strokeWidth="2" />
      {/* body */}
      <ellipse cx="-12" cy="96" rx="52" ry="36" fill="#A3A0B4" stroke={INK} strokeWidth="2" />
      {/* saddle cloth with scallops and dots */}
      <path d="M-44 66 H18 V112 Q 13 120 8 112 Q 3 120 -2 112 Q -7 120 -12 112 Q -17 120 -22 112 Q -27 120 -32 112 Q -37 120 -44 112 Z" fill={cloth} stroke={INK} strokeWidth="1.6" />
      <path d="M-44 74 H18" stroke="#FFD25A" strokeWidth="3" />
      {[-36, -24, -12, 0, 10].map((cx) => <circle key={cx} cx={cx} cy="94" r="3" fill="#FFD25A" />)}
      <path d="M-30 66 C -26 44, 4 44, 8 66 Z" fill="#D7264D" stroke={INK} strokeWidth="1.6" />
      <path d="M-11 46 v-10" stroke="#FFD25A" strokeWidth="2" /><circle cx="-11" cy="34" r="3" fill="#FFD25A" />
      {/* head, ear, trunk */}
      <circle cx="40" cy="78" r="30" fill="#A3A0B4" stroke={INK} strokeWidth="2" />
      <path d="M26 58 C 6 54, 0 80, 10 98 C 20 104, 30 96, 32 84 Z" fill="#B8B5C8" stroke={INK} strokeWidth="1.8" />
      <path d="M62 86 C 76 92, 80 70, 78 50 C 76 36, 88 26, 96 32" fill="none" stroke="#A3A0B4" strokeWidth="13" strokeLinecap="round" />
      <path d="M62 86 C 76 92, 80 70, 78 50 C 76 36, 88 26, 96 32" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" strokeDasharray="0" opacity="0.35" />
      <path d="M58 96 c 6 2, 10 6, 10 10" fill="none" stroke="#F5F0E6" strokeWidth="4" strokeLinecap="round" />
      <circle cx="48" cy="72" r="3" fill={INK} />
      {/* forehead ornament */}
      <path d="M34 50 L46 50 L40 64 Z" fill="#FFD25A" stroke={INK} strokeWidth="1.2" /><circle cx="40" cy="66" r="2.6" fill="#D7264D" />
    </g>
  )
}

/** Two decorated elephants whose trunks meet above a heart. */
export function RoyalElephants({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 280 160" className={className ?? 'mx-auto h-[150px] w-[262px]'} aria-hidden="true">
      <path d="M6 154 H274" stroke="#C9A13B" strokeWidth="1.5" />
      <Elephant x={70} cloth="#2F4FA8" />
      <Elephant x={210} flip cloth="#1F8A7A" />
      <path d="M140 46 c -7 -7, -17 -1, -11 9 c 3 4, 8 8, 11 11 c 3 -3, 8 -7, 11 -11 c 6 -10, -4 -16, -11 -9 z" fill="#E8466A" />
      <g fill="#F2A3B8">{[[124, 16], [156, 14], [140, 6]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" />)}</g>
    </svg>
  )
}

/** A peacock with its tail fanned out, feathers drawn one by one. */
export function Peacock({ className }: { className?: string }) {
  const feathers = Array.from({ length: 15 }, (_, i) => -84 + i * 12)
  return (
    <svg viewBox="0 0 280 170" className={className ?? 'mx-auto h-[150px] w-[250px]'} aria-hidden="true">
      <g transform="translate(140 150)">
        {feathers.map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <path d="M0 0 C -4 -50, -3 -90, 0 -118" stroke="#2E7D6B" strokeWidth="1.4" fill="none" />
            <ellipse cx="0" cy="-118" rx="11" ry="16" fill="#1F9E83" />
            <ellipse cx="0" cy="-116" rx="7.5" ry="11" fill="#E8B23A" />
            <ellipse cx="0" cy="-115" rx="5" ry="7.5" fill="#1E5FA8" />
            <ellipse cx="0" cy="-114" rx="2.6" ry="4" fill="#12204A" />
          </g>
        ))}
        {feathers.slice(0, -1).map((a) => (
          <g key={`s${a}`} transform={`rotate(${a + 6})`}><ellipse cx="0" cy="-80" rx="6" ry="10" fill="#2FAF8F" opacity="0.8" /><ellipse cx="0" cy="-79" rx="3" ry="5" fill="#1E5FA8" /></g>
        ))}
        <ellipse cx="0" cy="-26" rx="14" ry="26" fill="#1E5FA8" />
        <ellipse cx="-3" cy="-30" rx="5" ry="12" fill="#2E8BD0" opacity="0.6" />
        <circle cx="0" cy="-56" r="9" fill="#1E5FA8" />
        <path d="M8 -58 l8 3 -8 3 z" fill="#E8B23A" />
        <circle cx="3" cy="-58" r="1.6" fill="#fff" />
        <path d="M2 -60 c 4 2, 6 0, 7 -1" stroke="#fff" strokeWidth="1.2" fill="none" />
        {[-6, 0, 6].map((dx) => <g key={dx}><path d={`M0 -64 L${dx} -78`} stroke="#1E5FA8" strokeWidth="1" /><circle cx={dx} cy="-79" r="2.2" fill="#1F9E83" /></g>)}
        <path d="M-6 0 l-2 10 M6 0 l2 10" stroke="#8A6A3A" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    </svg>
  )
}
