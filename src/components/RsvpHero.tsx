import clsx from 'clsx'
import { ILLUSTRATED, type RsvpTemplate } from '../lib/templates'
import { LoveBirds, PandaKoala, Peacock, RoyalElephants } from './Illustrations'
import { Arch, DecoFan, GoldDivider, Mandala, Monogram, PopConfetti, Sprig, Toran } from './Ornaments'

interface Props {
  t: RsvpTemplate
  bride: string
  groom: string
  venue: string
  city: string
  compact?: boolean
}

const ART = { pandakoala: PandaKoala, lovebirds: LoveBirds, elephants: RoyalElephants, peacock: Peacock } as const

const gutter = { paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }

/** Header of the guest pages, drawn in the chosen RSVP design. */
export default function RsvpHero({ t, bride, groom, venue, city, compact }: Props) {
  const namesFont = { fontFamily: 'var(--names-font)' }
  const Art = ILLUSTRATED.includes(t.ornament) ? ART[t.ornament as keyof typeof ART] : null

  if (compact) {
    return (
      <>
        {t.ornament === 'toran' && <div className="mx-auto h-[52px] max-w-[720px] overflow-hidden"><Toran /></div>}
        <header className={clsx('text-center', t.ornament !== 'toran' && !Art && 'pt-6', Art && 'pt-3')} style={gutter}>
          {Art && <Art className="mx-auto h-[76px] w-[130px]" />}
          <div className={clsx(t.namesClass, '!text-[30px] !leading-[1.15] !tracking-normal', t.names.includes('Vibes') && '!text-[40px]')} style={namesFont}>
            {bride} <span className="text-gold">&amp;</span> {groom}
          </div>
          <div className="mt-0.5 text-[14px] text-muted">11 to 13 December 2026 · {city}</div>
        </header>
      </>
    )
  }

  const names = (
    <h1 className={t.namesClass} style={namesFont}>
      {t.stacked ? (
        <>{bride}<span className={t.ampClass}>&amp;</span>{groom}</>
      ) : (
        <>{bride} <span className={clsx('align-middle', t.ampClass)}>&amp;</span> {groom}</>
      )}
    </h1>
  )
  const kicker = <div className={clsx('text-[15px] text-muted', t.head.includes('Bricolage') ? 'font-semibold text-plum' : 'font-serif italic')}>{t.kicker}</div>
  const invite = <div className={clsx('text-[16px] text-ink/80', t.head.includes('Bricolage') ? 'font-medium' : 'font-serif italic')}>{t.invite}</div>
  const date = <div className={clsx('text-ink', t.dateClass)}>11 · 12 · 13 December 2026</div>
  const place = <div className="mt-1 text-[15px] text-muted">{venue}, {city}</div>

  return (
    <header className="relative overflow-hidden text-center">
      {t.ornament === 'toran' && <div className="mx-auto max-w-[720px]"><Toran /></div>}
      <div className="relative mx-auto max-w-[560px]" style={gutter}>
        {t.ornament === 'toran' && (
          <>
            <Mandala className="pointer-events-none absolute left-1/2 top-[-40px] h-[340px] w-[340px] -translate-x-1/2 opacity-[0.16]" />
            <div className="relative pt-2 pb-2">
              {kicker}<div className="mt-1">{names}</div>{invite}
              <GoldDivider className="mx-auto mt-3 h-6 w-[200px]" />
              <div className="mt-2">{date}</div>{place}
            </div>
          </>
        )}

        {Art && (
          <div className="pt-8 pb-4">
            <Art />
            <div className={clsx('mt-3 text-[15px]', t.head.includes('Fraunces') ? 'font-medium text-plum' : 'font-serif italic text-muted')}>{t.kicker}</div>
            <div className="mt-1">{names}</div>
            {invite}
            <div className="mt-5 inline-flex flex-col items-center rounded-2xl border border-gold/40 bg-surface/80 px-6 py-2.5">
              {date}<div className="text-[13.5px] text-muted">{venue}, {city}</div>
            </div>
          </div>
        )}

        {t.ornament === 'monogram' && (
          <div className="pt-12 pb-4">
            <Monogram a={bride[0]} b={groom[0]} />
            <div className="mt-6 text-[12px] font-medium uppercase tracking-[0.32em] text-muted">{t.kicker}</div>
            <div className="mt-5">{names}</div>
            <div className="mx-auto my-6 h-px w-16 bg-ink/40" />
            {date}
            <div className="mt-2 text-[14px] text-muted">{venue}, {city}</div>
            <div className="mt-5 font-serif italic text-[17px] text-ink/80">{t.invite}</div>
          </div>
        )}

        {t.ornament === 'deco' && (
          <div className="pt-10 pb-4">
            <DecoFan />
            <div className="mt-4 text-[12px] font-medium uppercase tracking-[0.32em] text-muted">{t.kicker}</div>
            <div className="mt-4">{names}</div>
            <div className="mx-auto my-5 flex items-center justify-center gap-3 text-gold"><span className="h-px w-12 bg-gold" /><span className="rotate-45 inline-block h-2 w-2 border border-gold" /><span className="h-px w-12 bg-gold" /></div>
            {date}{place}
            <div className="mt-4 font-serif italic text-[17px] text-ink/80">{t.invite}</div>
          </div>
        )}

        {t.ornament === 'sprig' && (
          <div className="pt-10 pb-4">
            <div className="flex items-center justify-center gap-2"><Sprig /><Sprig flip /></div>
            <div className="mt-3 font-serif italic text-[16px] text-muted">{t.kicker}</div>
            <div className="mt-1">{names}</div>
            <div className="text-[16px] text-ink/80" style={{ fontFamily: 'var(--head-font)', fontStyle: 'italic' }}>{t.invite}</div>
            <div className="mt-5 inline-flex flex-col items-center rounded-full border border-plum/30 bg-surface/70 px-6 py-2.5">
              {date}<div className="text-[13.5px] text-muted">{venue}, {city}</div>
            </div>
          </div>
        )}

        {t.ornament === 'pop' && (
          <div className="relative pt-12 pb-4">
            <PopConfetti className="pointer-events-none absolute inset-x-[-16px] top-0 h-[300px] w-[calc(100%+32px)]" />
            <div className="relative">
              <div className="inline-flex rounded-full bg-plum px-3.5 py-1 text-[13px] font-semibold text-onplum">{t.kicker}</div>
              <div className="mt-4">{names}</div>
              {invite}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <span className="rounded-full bg-surface px-3.5 py-1.5 text-[13.5px] font-semibold shadow-sm border border-line">11–13 Dec 2026</span>
                <span className="rounded-full bg-surface px-3.5 py-1.5 text-[13.5px] font-semibold shadow-sm border border-line">{venue}, {city}</span>
              </div>
            </div>
          </div>
        )}

        {t.ornament === 'arch' && (
          <div className="relative mx-auto mt-6 max-w-[400px] px-8 pt-16 pb-8">
            <Arch className="pointer-events-none absolute inset-0 h-full w-full" />
            <div className="relative">
              <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-gold">{t.kicker}</div>
              <div className="mt-3">{names}</div>
              <div className="mt-1 text-[16px] text-ink/80" style={{ fontFamily: 'var(--head-font)', fontStyle: 'italic' }}>{t.invite}</div>
              <div className="mt-5">{date}</div>
              <div className="mt-1 text-[14px] text-muted">{venue}, {city}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
