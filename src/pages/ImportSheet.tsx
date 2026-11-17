import { AlertTriangle, ArrowRight, Check, FileSpreadsheet, Link2, Wand2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Choices, Modal, WhatsAppButton } from '../components/ui'
import type { Guest, Household, Side } from '../data/types'
import { addDays, fmtDay, fmtDow, nightsOf } from '../lib/dates'
import { sideHint, waUrl } from '../lib/family'
import { commonDeparture, guessDeparture, readSheet, sheetCsvUrl, splitNames, type SheetRow } from '../lib/sheetImport'
import { useStore } from '../store'

// Bring in replies the couple already collected with a Google Form: read the sheet, fix the few
// rows that need it, and every family who's coming lands on the Rooms page.

type Step = 'pick' | 'review' | 'done'

export default function ImportSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, dispatch } = useStore()
  const nav = useNavigate()
  const [step, setStep] = useState<Step>('pick')
  const [file, setFile] = useState('')
  const [rows, setRows] = useState<SheetRow[]>([])
  const [error, setError] = useState('')
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [side, setSide] = useState<Side | ''>('')
  const [fix, setFix] = useState<Record<number, string>>({}) // line -> departure date the couple chose
  const [added, setAdded] = useState<SheetRow[]>([])

  const close = () => { setStep('pick'); setFile(''); setRows([]); setError(''); setLink(''); setSide(''); setFix({}); onClose() }
  const load = (text: string, name: string) => {
    const r = readSheet(text)
    if (r.error) return setError(r.error)
    setError(''); setRows(r.rows); setFile(name); setStep('review')
  }
  const fromLink = async () => {
    const url = sheetCsvUrl(link)
    if (!url) return setError('That doesn’t look like a Google Sheets link. Open your responses sheet and copy the link from the address bar.')
    setLoading(true)
    try {
      const res = await fetch(url)
      const text = await res.text()
      if (!res.ok || text.trimStart().startsWith('<')) throw new Error()
      load(text, 'Your Google Sheet')
    } catch {
      setError('We couldn’t open that sheet. In Google Sheets, tap Share and set it to “Anyone with the link”, then try again. Or download it as CSV and choose the file.')
    } finally { setLoading(false) }
  }

  const known = new Set(data.guests.map((g) => g.email?.toLowerCase()).filter(Boolean))
  const fresh = rows.filter((r) => !r.email || !known.has(r.email.toLowerCase()))
  const already = rows.length - fresh.length
  const coming = fresh.filter((r) => r.coming !== 'NO')
  const notComing = fresh.filter((r) => r.coming === 'NO')
  const look = coming.filter((r) => r.missingDeparture || r.departureBeforeArrival)
  const fixedRows = coming.filter((r) => r.fixed.length)
  const usual = commonDeparture(rows)
  const open_ = look.filter((r) => !fix[r.line])
  const departureOf = (r: SheetRow) => fix[r.line] ?? (r.departureBeforeArrival ? undefined : r.departure)

  const save = () => {
    for (const r of fresh) {
      // shortcut: same as newId('h') on the backend branch; use that once it merges. The id is the guest link, so it must be random.
      const id = 'h' + Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('')
      const names = splitNames(r.name)
      const out = departureOf(r)
      const dated = r.coming !== 'NO' && !!r.arrival && !!out
      const guests: Guest[] = Array.from({ length: r.coming === 'NO' ? names.length : r.count }, (_, i) => {
        const [first, ...rest] = (names[i] ?? `Guest ${i + 1}`).split(' ')
        return {
          id: `${id}_g${i + 1}`, householdId: id, firstName: first, lastName: rest.join(' '), email: i === 0 ? r.email : undefined,
          type: 'ADULT', side: side as Side, relationship: '', tags: [], rsvp: r.coming, attendance: {},
          stay: dated ? { needs: 'YES', checkIn: r.arrival, checkOut: out } : { needs: r.coming === 'NO' ? 'NO' : 'UNSURE', checkIn: r.arrival },
          travel: { arrivalDate: r.arrival, arrivalTime: r.arrivalTime, departureDate: out, departureTime: r.departureTime },
        }
      })
      const household: Household = { id, name: r.name, side: side as Side, city: '', primaryContactId: guests[0].id, invitation: r.coming === 'NO' ? 'DECLINED' : 'SUBMITTED' }
      dispatch({ type: 'household/add', household, guests })
    }
    setAdded(fresh)
    setStep('done')
  }

  if (!open) return null

  if (step === 'pick') return (
    <Modal open onClose={close} title="Add replies from Google Forms">
      <p className="text-[14.5px] text-muted">Already collecting replies with a Google Form? Bring them here and we’ll sort out rooms for everyone who’s coming.</p>
      <label className="mt-4 block w-full cursor-pointer rounded-2xl border-2 border-dashed border-line p-6 text-center hover:bg-sunk">
        <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) f.text().then((t) => load(t, f.name))
          e.target.value = ''
        }} />
        <FileSpreadsheet className="mx-auto text-plum" size={30} />
        <div className="mt-2 text-[16px] font-semibold">Choose the responses file</div>
        <div className="text-[13px] text-muted">In Google Sheets: File → Download → CSV</div>
      </label>
      <div className="my-4 flex items-center gap-3 text-[13px] text-muted"><span className="h-px flex-1 bg-line" />or paste the sheet link<span className="h-px flex-1 bg-line" /></div>
      <div className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Google Sheet link</span>
          <Link2 size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input !min-h-[50px] !pl-10" inputMode="url" placeholder="https://docs.google.com/spreadsheets/…" value={link} onChange={(e) => setLink(e.target.value)} />
        </label>
        <button className="btn-primary !min-h-[50px] shrink-0" disabled={!link.trim() || loading} style={{ opacity: link.trim() && !loading ? 1 : 0.5 }} onClick={fromLink}>{loading ? 'Opening…' : 'Open'}</button>
      </div>
      {error && <p role="alert" className="mt-3 rounded-2xl bg-bad/10 p-3.5 text-[14px] text-bad">{error}</p>}
    </Modal>
  )

  if (step === 'done') {
    const stays = added.filter((r) => r.coming !== 'NO' && r.arrival && departureOf(r))
    const nights = [...new Set(stays.flatMap((r) => nightsOf(r.arrival!, departureOf(r)!)))].sort()
    const people = (n: string) => stays.filter((r) => r.arrival! <= n && n < departureOf(r)!).reduce((s, r) => s + r.count, 0)
    const max = Math.max(1, ...nights.map(people))
    return (
      <Modal open onClose={close} title="Replies added">
        <div className="flex items-center gap-2 text-[15px] font-semibold text-good"><Check size={18} /> {added.length} {added.length === 1 ? 'family' : 'families'} added to Guests</div>
        {nights.length > 0 && (
          <>
            <h3 className="mt-5 text-[14px] font-semibold">People staying each night</h3>
            <ul className="mt-2 grid gap-1.5">
              {nights.map((n) => (
                <li key={n} className="flex items-center gap-3 text-[14px]">
                  <span className="w-[92px] shrink-0 text-muted">{fmtDow(n)}</span>
                  <span className="h-6 rounded-md bg-plum/80" style={{ width: `${(people(n) / max) * 100}%`, minWidth: 6 }} />
                  <span className="shrink-0 font-semibold num">{people(n)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[13px] text-muted">Counts the night of {fmtDay(nights[0])} to the morning of {fmtDay(addDays(nights[nights.length - 1], 1))}.</p>
          </>
        )}
        <div className="mt-5 grid gap-2">
          <button className="btn-primary !min-h-[52px] text-[16px]" onClick={() => { close(); nav('/app/rooms') }}>Give them rooms <ArrowRight size={17} /></button>
          <button className="min-h-[44px] text-[14px] text-muted underline" onClick={close}>Later</button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal open onClose={close} title="Check the replies">
      <div className="rounded-2xl bg-good/10 p-4 text-[15px]">
        <span className="font-semibold">{file}</span><br />
        <b>{coming.length}</b> coming ({coming.reduce((s, r) => s + r.count, 0)} people) · <b>{notComing.length}</b> not coming
        {already > 0 && <div className="mt-1 text-[13.5px] text-muted">{already} {already === 1 ? 'reply is' : 'replies are'} already in your list, we’ll skip {already === 1 ? 'it' : 'them'}.</div>}
      </div>

      {fresh.length > 0 && (
        <div className="mt-4">
          <div className="label !text-[14px]">Whose guests are these?</div>
          <Choices label="Whose side" value={side} onChange={setSide} options={[{ v: 'BRIDE', label: 'Bride’s', sub: sideHint.BRIDE }, { v: 'GROOM', label: 'Groom’s', sub: sideHint.GROOM }, { v: 'MUTUAL', label: 'Both', sub: 'Friends' }]} />
        </div>
      )}

      {look.length > 0 && (
        <section className="mt-5">
          <h3 className="flex items-center gap-1.5 text-[15px] font-semibold"><AlertTriangle size={17} className="text-warn" /> {look.length} {look.length === 1 ? 'reply needs' : 'replies need'} a quick look</h3>
          <ul className="mt-2 grid gap-2.5">
            {look.map((r) => {
              const guess = r.departureBeforeArrival ? guessDeparture(r.arrival!, r.departure!) : usual && usual > r.arrival! ? usual : undefined
              const ask = `Hi ${r.name.split(' ')[0]}! 🙂 Thanks for your reply. On which date will you leave after the wedding? We’re booking rooms and want to get your nights right.`
              return (
                <li key={r.line} className="rounded-2xl border border-warn/30 bg-warn/5 p-3.5">
                  <div className="text-[15px] font-semibold">{r.name}</div>
                  <div className="text-[14px] text-muted">
                    Arrives {fmtDay(r.arrival!)}, {r.departureBeforeArrival ? <>but leaving date says <b className="text-ink">{fmtDay(r.departure!)}</b>, which is before they arrive.</> : <>no leaving date.</>}
                  </div>
                  {fix[r.line] ? (
                    <div className="mt-2 flex items-center justify-between gap-2 text-[14px]">
                      <span className="flex items-center gap-1.5 font-medium text-good"><Check size={16} /> Leaving {fmtDay(fix[r.line])}</span>
                      <button className="min-h-[40px] text-[13.5px] text-plum underline" onClick={() => setFix(({ [r.line]: _, ...rest }) => rest)}>Change</button>
                    </div>
                  ) : (
                    <div className="mt-2.5 grid gap-2">
                      {guess && <button className="btn-ghost !min-h-[44px] !justify-start text-left" onClick={() => setFix({ ...fix, [r.line]: guess })}><Wand2 size={16} className="text-plum" /> {r.departureBeforeArrival ? `They probably meant ${fmtDay(guess)}` : `${fmtDay(guess)}, like most guests`}</button>}
                      <label className="flex items-center gap-2 text-[14px]">
                        <span className="shrink-0 text-muted">Other date</span>
                        <input type="date" className="input !min-h-[44px]" min={addDays(r.arrival!, 1)} onChange={(e) => e.target.value && setFix({ ...fix, [r.line]: e.target.value })} />
                      </label>
                      <WhatsAppButton small href={waUrl(undefined, ask)} className="!min-h-[44px] !text-[14px]">Ask them on WhatsApp</WhatsAppButton>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
          {open_.length > 0 && <p className="mt-2 text-[13px] text-muted">You can also leave {open_.length === 1 ? 'it' : 'them'} for now. We’ll add {open_.length === 1 ? 'them' : 'these families'} without a room until you know the date.</p>}
        </section>
      )}

      {fixedRows.length > 0 && (
        <section className="mt-5">
          <h3 className="text-[15px] font-semibold">We fixed {fixedRows.length === 1 ? 'this' : 'these'} for you</h3>
          <ul className="mt-2 divide-y divide-line rounded-2xl border border-line text-[14px]">
            {fixedRows.map((r) => <li key={r.line} className="px-3.5 py-2.5"><b>{r.name}</b><div className="text-muted">{r.fixed.join('. ')}.</div></li>)}
          </ul>
        </section>
      )}

      {notComing.length > 0 && (
        <details className="mt-5 rounded-2xl border border-line">
          <summary className="min-h-[44px] cursor-pointer px-3.5 py-3 text-[15px] font-semibold">{notComing.length} can’t come</summary>
          <ul className="divide-y divide-line border-t border-line text-[14px]">
            {notComing.map((r) => <li key={r.line} className="px-3.5 py-2.5"><b>{r.name}</b>{r.note && <div className="text-muted">“{r.note}”</div>}</li>)}
          </ul>
        </details>
      )}

      <button className="btn-primary mt-5 w-full !min-h-[52px] text-[16px]" disabled={!side || !fresh.length} style={{ opacity: side && fresh.length ? 1 : 0.5 }} onClick={save}>
        {fresh.length ? `Add ${fresh.length} ${fresh.length === 1 ? 'family' : 'families'}` : 'Nothing new to add'}
      </button>
      {fresh.length > 0 && !side && <p className="mt-1.5 text-center text-[13px] text-muted">Pick whose guests these are first.</p>}
      <button className="mt-1 min-h-[44px] w-full text-[14px] text-muted underline" onClick={() => setStep('pick')}>Choose a different file</button>
    </Modal>
  )
}
