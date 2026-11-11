import type { CSSProperties } from 'react'
// RSVP designs the couple can pick from. Each one is a set of colour tokens (RGB triplets, same names as
// the app's), two fonts and an ornament. Guest pages read the chosen one; nothing else changes per design.

export type Ornament = 'toran' | 'monogram' | 'deco' | 'sprig' | 'pop' | 'arch' | 'pandakoala' | 'lovebirds' | 'elephants' | 'peacock'
export type Category = 'classic' | 'modern' | 'artistic'
export const ILLUSTRATED: Ornament[] = ['pandakoala', 'lovebirds', 'elephants', 'peacock']

export interface RsvpTemplate {
  id: string
  name: string
  mood: string
  category: Category
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
    id: 'marigold', name: 'Marigold Classic', mood: 'Traditional. Toran garland, script names, ivory, maroon and gold.', category: 'classic',
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
    id: 'ivory', name: 'Ivory Minimal', mood: 'Editorial and quiet. Black on white, wide spacing, a simple monogram.', category: 'modern',
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
    id: 'midnight', name: 'Midnight Deco', mood: 'Black-tie evening. Deep navy, gold lines and an art deco sunburst.', category: 'modern', dark: true,
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
    id: 'sage', name: 'Sage Garden', mood: 'Soft and natural. Sage green, cream and hand-drawn leaves.', category: 'modern',
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
    id: 'pop', name: 'Rani Pop', mood: 'Bold and playful. Hot pink to saffron, big type, confetti.', category: 'modern',
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
    id: 'terracotta', name: 'Desert Arch', mood: 'Warm Rajasthan. Terracotta and sand under a jharokha arch.', category: 'modern',
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
  {
    id: 'pandakoala', name: 'Panda & Koala', mood: 'Cute and cuddly. A panda bride and a koala groom in a saffron safa, among bamboo.', category: 'artistic',
    ornament: 'pandakoala', head: FRAUNCES, names: FRAUNCES,
    namesClass: 'text-[46px] sm:text-[54px] leading-[1.05] font-semibold text-ink', ampClass: 'text-plum',
    kicker: 'Two cuties are tying the knot', invite: 'come celebrate with us',
    dateClass: 'font-sans text-[14px] font-semibold',
    vars: {
      bg: '243 249 242', surface: '255 255 255', sunk: '232 242 230', ink: '43 34 48', muted: '100 108 100', line: '214 230 210',
      plum: '226 64 102', onplum: '255 255 255', plumsoft: '253 226 233', marigold: '243 154 30', gold: '111 168 104',
      good: '46 130 70', warn: '190 120 10', bad: '200 40 60', info: '60 100 180',
    },
    background: 'radial-gradient(100% 50% at 50% 0%, rgb(214 240 205 / 0.8), transparent 65%), rgb(var(--bg))',
  },
  {
    id: 'lovebirds', name: 'Love Birds', mood: 'Bright and joyful. Two parakeets on a flowering branch.', category: 'artistic',
    ornament: 'lovebirds', head: FRAUNCES, names: SCRIPT,
    namesClass: 'text-[56px] sm:text-[66px] leading-[1.05] font-normal text-plum', ampClass: 'font-serif italic text-[32px] text-gold',
    kicker: 'Two lovebirds are getting married', invite: 'and we’d love you there',
    dateClass: 'font-sans text-[13px] font-semibold tracking-[0.18em] uppercase',
    vars: {
      bg: '240 250 247', surface: '255 255 255', sunk: '226 243 239', ink: '20 52 56', muted: '84 112 112', line: '206 230 226',
      plum: '18 132 120', onplum: '255 255 255', plumsoft: '214 240 235', marigold: '255 176 60', gold: '226 70 106',
      good: '30 130 80', warn: '190 120 10', bad: '200 40 60', info: '60 100 180',
    },
    background: 'radial-gradient(100% 50% at 50% 0%, rgb(255 214 226 / 0.55), transparent 60%), rgb(var(--bg))',
  },
  {
    id: 'elephants', name: 'Royal Elephants', mood: 'Festive and regal. Decorated elephants meet in a wedding procession.', category: 'artistic',
    ornament: 'elephants', head: SERIF, names: SERIF, stacked: true,
    namesClass: 'text-[42px] sm:text-[50px] leading-[1.05] uppercase tracking-[0.08em] font-bold text-plum', ampClass: 'block normal-case italic font-semibold tracking-normal text-[30px] text-gold',
    kicker: 'Shubh Vivah', invite: 'request the joy of your presence',
    dateClass: 'font-sans text-[13px] font-semibold tracking-[0.18em] uppercase',
    vars: {
      bg: '255 248 235', surface: '255 253 247', sunk: '248 236 212', ink: '34 36 82', muted: '100 96 120', line: '238 220 186',
      plum: '47 79 168', onplum: '255 255 255', plumsoft: '224 230 248', marigold: '243 154 30', gold: '201 150 40',
      good: '40 120 70', warn: '180 110 10', bad: '190 40 50', info: '47 79 168',
    },
    background: 'radial-gradient(110% 55% at 50% 0%, rgb(255 214 140 / 0.45), transparent 60%), rgb(var(--bg))',
  },
  {
    id: 'peacock', name: 'Peacock Dance', mood: 'Rich jewel tones. A peacock in full display on deep teal.', category: 'artistic', dark: true,
    ornament: 'peacock', head: SERIF, names: SCRIPT,
    namesClass: 'text-[56px] sm:text-[66px] leading-[1.05] font-normal text-gold', ampClass: 'font-serif italic text-[32px] text-ink/80',
    kicker: 'Join our celebration', invite: 'as we begin our forever',
    dateClass: 'font-serif text-[18px] font-semibold tracking-[0.2em] uppercase',
    vars: {
      bg: '9 38 42', surface: '15 50 56', sunk: '22 62 68', ink: '240 246 238', muted: '160 192 186', line: '38 82 86',
      plum: '232 178 58', onplum: '24 24 10', plumsoft: '44 72 58', marigold: '240 190 80', gold: '232 178 58',
      good: '120 210 160', warn: '240 190 90', bad: '255 130 130', info: '140 180 250',
    },
    background: 'radial-gradient(90% 50% at 50% 0%, rgb(31 158 131 / 0.35), transparent 60%), rgb(var(--bg))',
  },
]

export const templateById = (id?: string | null) => templates.find((t) => t.id === id) ?? templates[0]

/** Inline style that applies a template's tokens to a subtree. */
export function templateStyle(t: RsvpTemplate): CSSProperties {
  const style: Record<string, string> = { colorScheme: t.dark ? 'dark' : 'light', background: t.background, '--head-font': t.head, '--names-font': t.names }
  for (const [k, v] of Object.entries(t.vars)) style[`--${k}`] = v
  return style as CSSProperties
}
