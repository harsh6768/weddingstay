// Read a Google Forms response sheet (CSV) into RSVP rows, and say in plain words what looks wrong.
// Column names differ per form, so columns are found by keywords in the header.

export interface SheetRow {
  line: number // row number in the sheet (header is row 1)
  name: string
  email?: string
  coming: 'YES' | 'NO' | 'MAYBE'
  count: number
  note?: string
  arrival?: string // YYYY-MM-DD
  arrivalTime?: string // HH:MM
  departure?: string
  departureTime?: string
  /** Changes we made on our own, shown so the couple can check them. */
  fixed: string[]
  /** Things only the couple (or the guest) can answer. */
  missingDeparture: boolean
  departureBeforeArrival: boolean
}

/** RFC 4180-ish CSV: quotes, doubled quotes, commas and newlines inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = [], cell = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ }
      else if (c === '"') q = false
      else cell += c
    } else if (c === '"') q = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell); rows.push(row); row = []; cell = ''
    } else cell += c
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  return rows.filter((r) => r.some((c) => c.trim()))
}

type Col = 'name' | 'email' | 'coming' | 'count' | 'note' | 'arrival' | 'arrivalTime' | 'departure' | 'departureTime'

export function findColumns(header: string[]): Partial<Record<Col, number>> {
  const cols: Partial<Record<Col, number>> = {}
  header.forEach((raw, i) => {
    const h = raw.toLowerCase()
    const set = (k: Col) => { if (cols[k] === undefined) cols[k] = i }
    // Order matters: "Number of guests attending" and "reason for not attending" both say "attending".
    if (/time ?stamp/.test(h)) return
    if (/e-?mail/.test(h)) return set('email')
    if (/arriv|check.?in|reach/.test(h)) return set(/time/.test(h) ? 'arrivalTime' : 'arrival')
    if (/depart|leav|check.?out|return/.test(h)) return set(/time/.test(h) ? 'departureTime' : 'departure')
    if (/number|how many|count|guests|people|pax/.test(h)) return set('count')
    if (/reason|why|note|message|comment/.test(h)) return set('note')
    if (/attend|coming|rsvp|join|be there/.test(h)) return set('coming')
    if (/name/.test(h)) return set('name')
  })
  return cols
}

/** "12/4/2026" or "2026-12-04" -> parts. Day/month order is decided once per sheet. */
const dateParts = (s: string) => {
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (iso) return { iso: true, a: +iso[2], b: +iso[3], y: iso[1] }
  const m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/)
  return m ? { iso: false, a: +m[1], b: +m[2], y: m[3] } : null
}
const pad = (n: number) => String(n).padStart(2, '0')

/** Google Sheets writes dates in the sheet's own locale: US is M/D/Y, India is D/M/Y. Any value over 12 settles it. */
export function dayFirst(values: string[]): boolean {
  for (const v of values) {
    const p = dateParts(v.trim())
    if (!p || p.iso) continue
    if (p.a > 12) return true
    if (p.b > 12) return false
  }
  return false
}

export function toIsoDate(s: string, dmy: boolean): { date?: string; yearFixed?: boolean } {
  const p = dateParts(s.trim())
  if (!p) return {}
  const [month, day] = p.iso || !dmy ? [p.a, p.b] : [p.b, p.a]
  if (month < 1 || month > 12 || day < 1 || day > 31) return {}
  // "0026" or "26": the guest meant 2026.
  const yearFixed = p.y.length !== 4 || p.y.startsWith('00')
  const year = yearFixed ? 2000 + (+p.y % 100) : +p.y
  return { date: `${year}-${pad(month)}-${pad(day)}`, yearFixed }
}

/** "2:00:00 PM" or "14:00" -> "14:00" */
export function toTime(s: string): string | undefined {
  const m = s.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([ap])?\.?m?\.?$/i)
  if (!m) return undefined
  let h = +m[1]
  const ap = m[3]?.toLowerCase()
  if (ap === 'p' && h < 12) h += 12
  if (ap === 'a' && h === 12) h = 0
  return h < 24 ? `${pad(h)}:${m[2]}` : undefined
}

/** "Rachit and Shabdita" -> two people. */
export const splitNames = (name: string) => name.split(/\s*(?:,|&|\+|\band\b)\s*/i).map((n) => n.trim()).filter(Boolean)

/** Departure "6 Nov" with arrival "4 Dec" is almost always the wrong month picked: offer the same day in the arrival month. */
export function guessDeparture(arrival: string, departure: string): string | undefined {
  const guess = arrival.slice(0, 8) + departure.slice(8, 10)
  return guess > arrival ? guess : undefined
}

export function readSheet(text: string): { rows: SheetRow[]; error?: string } {
  const all = parseCsv(text.replace(/^﻿/, ''))
  if (all.length < 2) return { rows: [], error: 'This file looks empty. Download the responses sheet as CSV and try again.' }
  const [header, ...body] = all
  const c = findColumns(header)
  if (c.name === undefined) return { rows: [], error: 'We couldn’t find a “Name” column. Is this the responses sheet from your Google Form?' }
  const get = (r: string[], k: Col) => (c[k] === undefined ? '' : (r[c[k]!] ?? '').trim())
  const dmy = dayFirst(body.flatMap((r) => [get(r, 'arrival'), get(r, 'departure'), r[0] ?? '']))

  const rows = body.map((r, i): SheetRow | null => {
    const name = get(r, 'name').replace(/\s+/g, ' ')
    if (!name) return null
    const ans = get(r, 'coming')
    const coming = !c.coming || /yes|be there|coming|haan|attend|join|will/i.test(ans) ? 'YES' : /maybe|not sure|may be/i.test(ans) ? 'MAYBE' : 'NO'
    const names = splitNames(name)
    const given = parseInt(get(r, 'count'), 10)
    const count = Math.max(Number.isFinite(given) && given > 0 ? given : 1, names.length)
    const fixed: string[] = []
    if (names.length > 1) fixed.push(`${names.length} names in one row, added as ${names.length} people`)
    if (Number.isFinite(given) && given > 0 && names.length > given) fixed.push(`Said ${given} ${given === 1 ? 'guest' : 'guests'} but wrote ${names.length} names, counted ${names.length}`)

    const a = toIsoDate(get(r, 'arrival'), dmy)
    const d = toIsoDate(get(r, 'departure'), dmy)
    if (a.yearFixed || d.yearFixed) fixed.push(`Year was typed as “${(a.yearFixed ? get(r, 'arrival') : get(r, 'departure')).split(/[/.-]/).pop()}”, changed to ${(a.date ?? d.date)!.slice(0, 4)}`)
    const yes = coming !== 'NO'
    return {
      line: i + 2, name, email: get(r, 'email') || undefined, coming, count,
      note: get(r, 'note') || undefined,
      arrival: a.date, arrivalTime: toTime(get(r, 'arrivalTime')),
      departure: d.date, departureTime: toTime(get(r, 'departureTime')),
      fixed: yes ? fixed : [],
      missingDeparture: yes && !!a.date && !d.date,
      departureBeforeArrival: yes && !!a.date && !!d.date && d.date <= a.date,
    }
  })
  return { rows: rows.filter((x): x is SheetRow => !!x) }
}

export const needsLook = (r: SheetRow) => r.missingDeparture || r.departureBeforeArrival

/** The departure date most guests gave, as a one-tap answer for those who left it blank. */
export function commonDeparture(rows: SheetRow[]): string | undefined {
  const n = new Map<string, number>()
  rows.forEach((r) => r.departure && !r.departureBeforeArrival && n.set(r.departure, (n.get(r.departure) ?? 0) + 1))
  return [...n].sort((x, y) => y[1] - x[1])[0]?.[0]
}

/** A shared Google Sheet link -> a CSV address the browser can read. Needs "Anyone with the link can view". */
export function sheetCsvUrl(link: string): string | undefined {
  const id = link.match(/\/spreadsheets\/d\/(?:e\/)?([\w-]{20,})/)?.[1]
  if (!id) return undefined
  const gid = link.match(/[?&#]gid=(\d+)/)?.[1]
  const g = gid ? `&gid=${gid}` : ''
  // Published-to-web links (/d/e/...) and normal share links use different CSV addresses.
  return link.includes('/d/e/') ? `https://docs.google.com/spreadsheets/d/e/${id}/pub?output=csv${g}` : `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv${g}`
}
