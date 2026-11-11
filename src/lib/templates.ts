import type { CSSProperties } from 'react'
// RSVP designs the couple can pick from. Each one is a set of colour tokens (RGB triplets, same names as
// the app's), two fonts and an ornament. Guest pages read the chosen one; nothing else changes per design.

export type Ornament = 'toran' | 'monogram' | 'deco' | 'sprig' | 'pop' | 'arch'

export interface RsvpTemplate {
  id: string
  name: string
  mood: string
  modern: boolean
  dark?: boolean
  ornament: Ornament
  /** Font for headings on the guest pages. */
  head: string
  /** Font for the couple's names. */
  names: string
  /** Extra classes for the names line: size, weight, case, colour. */
  namesClass: string
  /** Classes for the ampersand between the names. */
  ampClass: string
  /** Stack the names on separate lines with the ampersand between. */
  stacked?: boolean
  kicker: string
  invite: string
  /** Classes for the date line. */
  dateClass: string
  vars: Record<string, string>
  background: string
}

const SERIF = '"Cormorant Garamond", Georgia, serif'
const FRAUNCES = 'Fraunces, Georgia, serif'
const SCRIPT = '"Great Vibes", "Cormorant Garamond", cursive'
const GROTESK = '"Bricolage Grotesque", Inter, system-ui, sans-serif'

export const templates: RsvpTemplate[] = [
  {
    id: 'marigold', name: 'Marigold Classic', mood: 'Traditional. Toran garland, script names, ivory, maroon and gold.', modern: false,
    ornament: 'toran', head: SERIF, names: SCRIPT,
    namesClass: 'text-[56px] sm:text-[68px] leading-[1.05] text-plum font-normal', ampClass: 'font-serif italic text-[34px] sm:text-[40px] text-gold',
    kicker: 'Together with their families', invite: 'request the pleasure of your company',
    dateClass: 'font-serif text-[19px] font-semibold tracking-[0.12em] uppercase',
    vars: {
      bg: '251 246 238', surface: '255 252 246', sunk: '245 236 222', ink: '62 16 30', muted: '122 88 84', line: '232 214 190',
      plum: '128 22 48', onplum: '255 247 232', plumsoft: '247 226 222', marigold: '222 140 26', gold: '176 132 38',
      good: '46 120 70', warn: '176 110 10', bad: '176 36 46', info: '60 90 160',
    },
    background: 'radial-gradient(120% 60% at 50% 0%, rgb(255 236 200 / 0.55), transparent 60%), rgb(var(--bg))',
  },
  {
    id: 'ivory', name: 'Ivory Minimal', mood: 'Editorial and quiet. Black on white, wide spacing, a simple monogram.', modern: true,
    ornament: 'monogram', head: SERIF, names: SERIF, stacked: true,
    namesClass: 'text-[34px] sm:text-[40px] leading-[1.15] uppercase tracking-[0.2em] font-medium text-ink', ampClass: 'block font-serif italic normal-case tracking-normal text-[24px] text-muted my-1',
    kicker: 'Save the date', invite: 'We would love for you to be there',
    dateClass: 'font-sans text-[12.5px] font-medium tracking-[0.32em] uppercase',
    vars: {
      bg: '250 249 246', surface: '255 255 255', sunk: '243 242 238', ink: '22 22 22', muted: '112 109 103', line: '228 226 220',
      plum: '22 22 22', onplum: '255 255 255', plumsoft: '238 237 232', marigold: '170 140 90', gold: '160 150 130',
      good: '40 120 80', warn: '170 110 20', bad: '180 40 40', info: '60 90 160',
    },
    background: 'rgb(var(--bg))',
  },
  {
    id: 'midnight', name: 'Midnight Deco', mood: 'Black-tie evening. Deep navy, gold lines and an art deco sunburst.', modern: true, dark: true,
    ornament: 'deco', head: SERIF, names: SERIF, stacked: true,
    namesClass: 'text-[40px] sm:text-[48px] leading-[1.05] uppercase tracking-[0.14em] font-semibold text-gold', ampClass: 'block font-serif italic normal-case tracking-normal text-[26px] text-ink/80 my-1',
    kicker: 'An evening to remember', invite: 'Join us as we celebrate',
    dateClass: 'font-serif text-[18px] font-semibold tracking-[0.24em] uppercase text-gold',
    vars: {
      bg: '13 17 33', surface: '21 26 48', sunk: '30 36 62', ink: '244 236 216', muted: '170 166 160', line: '50 57 88',
      plum: '214 178 98', onplum: '22 18 8', plumsoft: '54 48 40', marigold: '232 192 112', gold: '214 178 98',
      good: '120 204 150', warn: '240 190 90', bad: '255 130 130', info: '150 170 240',
    },
    background: 'radial-gradient(90% 50% at 50% 0%, rgb(214 178 98 / 0.14), transparent 60%), rgb(var(--bg))',
  },
  {
    id: 'sage', name: 'Sage Garden', mood: 'Soft and natural. Sage green, cream and hand-drawn leaves.', modern: true,
    ornament: 'sprig', head: FRAUNCES, names: FRAUNCES,
    namesClass: 'text-[46px] sm:text-[56px] leading-[1.05] italic font-light text-plum', ampClass: 'font-light text-[34px] text-gold',
    kicker: 'With joy in our hearts', invite: 'we invite you to our wedding',
    dateClass: 'font-sans text-[13px] font-medium tracking-[0.22em] uppercase',
    vars: {
      bg: '244 245 237', surface: '252 252 246', sunk: '233 236 224', ink: '36 50 38', muted: '98 110 96', line: '214 220 204',
      plum: '72 102 74', onplum: '250 250 242', plumsoft: '224 233 219', marigold: '200 150 80', gold: '158 140 92',
      good: '46 120 70', warn: '170 110 20', bad: '176 50 50', info: '60 100 150',
    },
    background: 'radial-gradient(100% 50% at 50% 0%, rgb(200 214 186 / 0.55), transparent 60%), rgb(var(--bg))',
  },
  {
    id: 'pop', name: 'Rani Pop', mood: 'Bold and playful. Hot pink to saffron, big type, confetti.', modern: true,
    ornament: 'pop', head: GROTESK, names: GROTESK, stacked: true,
    namesClass: 'text-[58px] sm:text-[72px] leading-[0.9] font-extrabold tracking-[-0.03em] bg-gradient-to-r from-[rgb(225_30_110)] to-[rgb(255_140_40)] bg-clip-text text-transparent', ampClass: 'block text-[28px] font-bold tracking-normal text-ink my-1',
    kicker: 'We’re getting married!', invite: 'and it isn’t a party without you',
    dateClass: 'font-sans text-[15px] font-semibold',
    vars: {
      bg: '255 247 250', surface: '255 255 255', sunk: '252 236 243', ink: '32 10 30', muted: '112 80 102', line: '246 214 230',
      plum: '222 30 110', onplum: '255 255 255', plumsoft: '255 226 239', marigold: '255 150 40', gold: '255 140 40',
      good: '20 140 90', warn: '200 120 0', bad: '200 30 60', info: '70 90 220',
    },
    background: 'rgb(var(--bg))',
  },
  {
    id: 'terracotta', name: 'Desert Arch', mood: 'Warm Rajasthan. Terracotta and sand under a jharokha arch.', modern: true,
    ornament: 'arch', head: FRAUNCES, names: SERIF,
    namesClass: 'text-[44px] sm:text-[52px] leading-[1.05] italic font-semibold text-plum', ampClass: 'font-serif italic text-[32px] text-gold',
    kicker: 'Under the Udaipur sky', invite: 'please join us for our wedding',
    dateClass: 'font-sans text-[13px] font-semibold tracking-[0.2em] uppercase',
    vars: {
      bg: '250 240 228', surface: '255 250 242', sunk: '243 227 208', ink: '72 34 20', muted: '134 98 78', line: '234 211 186',
      plum: '182 82 46', onplum: '255 248 238', plumsoft: '247 221 204', marigold: '222 132 50', gold: '196 140 70',
      good: '60 120 70', warn: '176 110 10', bad: '176 40 40', info: '60 90 150',
    },
    background: 'radial-gradient(110% 55% at 50% 0%, rgb(240 196 150 / 0.45), transparent 60%), rgb(var(--bg))',
  },
]

export const templateById = (id?: string | null) => templates.find((t) => t.id === id) ?? templates[0]

/** Inline style that applies a template's tokens to a subtree. */
export function templateStyle(t: RsvpTemplate): CSSProperties {
  const style: Record<string, string> = { colorScheme: t.dark ? 'dark' : 'light', background: t.background, '--head-font': t.head, '--names-font': t.names }
  for (const [k, v] of Object.entries(t.vars)) style[`--${k}`] = v
  return style as CSSProperties
}
