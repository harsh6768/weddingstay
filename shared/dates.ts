// Date-only helpers. Stays use check-in included, check-out excluded:
// 11 Dec -> 14 Dec consumes the nights of 11, 12 and 13 Dec.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const toUtc = (d: string) => {
  const [y, m, day] = d.split('-').map(Number)
  return Date.UTC(y, m - 1, day)
}
const fromUtc = (t: number) => new Date(t).toISOString().slice(0, 10)

export const addDays = (d: string, n: number) => fromUtc(toUtc(d) + n * 864e5)

/** Nights a stay consumes: [checkIn, checkOut). */
export function nightsOf(checkIn: string, checkOut: string): string[] {
  const out: string[] = []
  for (let d = checkIn; d < checkOut; d = addDays(d, 1)) out.push(d)
  return out
}

export const nightCount = (checkIn: string, checkOut: string) => Math.max(0, (toUtc(checkOut) - toUtc(checkIn)) / 864e5)

export const overlaps = (aIn: string, aOut: string, bIn: string, bOut: string) => aIn < bOut && bIn < aOut

/** "11 Dec" */
export const fmtDay = (d: string) => `${Number(d.slice(8, 10))} ${MONTHS[Number(d.slice(5, 7)) - 1]}`

/** "Fri 11 Dec" */
export const fmtDow = (d: string) => `${DAYS[new Date(toUtc(d)).getUTCDay()]} ${fmtDay(d)}`

/** "11 to 14 Dec" */
export const fmtRange = (a: string, b: string) =>
  a.slice(5, 7) === b.slice(5, 7) ? `${Number(a.slice(8, 10))} to ${fmtDay(b)}` : `${fmtDay(a)} to ${fmtDay(b)}`

export const fmtTime = (t?: string) => {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ap = h >= 12 ? 'pm' : 'am'
  const hh = h % 12 === 0 ? 12 : h % 12
  return m ? `${hh}:${String(m).padStart(2, '0')} ${ap}` : `${hh} ${ap}`
}

export const inr = (n: number) => '₹' + n.toLocaleString('en-IN')
