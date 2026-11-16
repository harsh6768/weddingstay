import { useEffect, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mark } from './AppShell'

// Shared chrome for the public pages: header, footer, parallax and scroll reveal.

export const gutter = { paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }
export const wrap = 'mx-auto max-w-[1180px]'

/** Scroll to a section of the home page, going there first if we're elsewhere. */
export function useGoTo() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  return (id: string) => {
    if (pathname === '/') document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else nav('/', { state: { scrollTo: id } })
  }
}

/** On the home page, honour a section passed from another page. */
export function useScrollToState() {
  const { state } = useLocation() as { state: { scrollTo?: string } | null }
  useEffect(() => {
    if (!state?.scrollTo) return
    const t = setTimeout(() => document.getElementById(state.scrollTo!)?.scrollIntoView({ block: 'start' }), 60)
    return () => clearTimeout(t)
  }, [state])
}

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Parallax and scroll reveal. Every element with data-speed inside the page moves by (distance from viewport centre × speed).
 * Positive speeds drift up slower than the page; negative ones move against it. One rAF-throttled listener.
 */
export function useParallax() {
  useEffect(() => {
    // Scroll reveal for every .reveal element on the page.
    const items = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
    if (reduced() || !('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('in')); return }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px' })
    items.forEach((el) => io.observe(el))

    let raf = 0
    const els = () => Array.from(document.querySelectorAll<HTMLElement>('[data-speed]'))
    const update = () => {
      raf = 0
      const vh = window.innerHeight
      for (const el of els()) {
        const speed = Number(el.dataset.speed)
        const host = el.parentElement ?? el
        const r = host.getBoundingClientRect()
        if (r.bottom < -200 || r.top > vh + 200) continue
        // Zero when the element's centre crosses the viewport centre, or at the top of the page for
        // elements that start above that line, so nothing is displaced on first paint.
        const docCentre = r.top + window.scrollY + r.height / 2
        const offset = (window.scrollY - Math.max(0, docCentre - vh / 2)) * speed
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)${el.dataset.rot ? ` rotate(${el.dataset.rot}deg)` : ''}`
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [])
}

export function SiteHeader() {
  const go = useGoTo()
  return (
    <header className="sticky z-30 border-b border-line/60 bg-bg/80 backdrop-blur-xl" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
      <div className={`${wrap} flex items-center justify-between gap-3 py-3`} style={gutter}>
        <Link to="/" className="flex items-center gap-2"><Mark className="h-7 w-7" /><span className="font-display text-[20px] font-semibold">WeddingStay</span></Link>
        <nav className="hidden lg:flex items-center gap-1 text-[14px] text-muted">
          {[['features', 'Features'], ['designs', 'Invite designs'], ['how', 'How it works'], ['faq', 'Questions']].map(([id, label]) => (
            <button key={id} onClick={() => go(id)} className="rounded-full px-3 py-2 hover:bg-sunk hover:text-ink">{label}</button>
          ))}
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link to="/login" className="btn !px-3 sm:!px-4 text-ink hover:bg-sunk">Log in</Link>
          <Link to="/register" className="btn-primary"><span>Sign up<span className="hidden sm:inline"> free</span></span></Link>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  const go = useGoTo()
  const col = (title: string, items: ReactNode[]) => (
    <div className="min-w-0">
      <div className="text-[12.5px] font-semibold uppercase tracking-[0.16em] text-ink">{title}</div>
      <ul className="mt-4 grid gap-2.5 text-[14px] text-muted">{items.map((it, i) => <li key={i}>{it}</li>)}</ul>
    </div>
  )
  const a = 'hover:text-ink transition-colors'
  return (
    <footer className="border-t border-line bg-sunk/40">
      <div className={`${wrap} py-14`} style={gutter}>
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="min-w-0">
            <Link to="/" className="flex items-center gap-2"><Mark className="h-8 w-8" /><span className="font-display text-[22px] font-semibold">WeddingStay</span></Link>
            <p className="mt-3 max-w-[34ch] text-[14px] leading-relaxed text-muted">Guest lists, RSVPs and hotel rooms for Indian weddings, in one place. Made in India, for big fat Indian weddings.</p>
            <Link to="/register" className="btn-primary mt-5">Create your wedding</Link>
          </div>
          {col('Product', [
            <button className={a} onClick={() => go('features')}>Features</button>,
            <button className={a} onClick={() => go('designs')}>Invite designs</button>,
            <button className={a} onClick={() => go('how')}>How it works</button>,
            <Link className={a} to="/app">Sample wedding</Link>,
          ])}
          {col('For guests', [
            <Link className={a} to="/g/h02">See a guest invite</Link>,
            <Link className={a} to="/g/h02/stay">See a stay page</Link>,
            <button className={a} onClick={() => go('faq')}>Questions</button>,
          ])}
          {col('Account & legal', [
            <Link className={a} to="/login">Log in</Link>,
            <Link className={a} to="/register">Sign up</Link>,
            <Link className={a} to="/terms">Terms and Conditions</Link>,
            <Link className={a} to="/privacy">Privacy Policy</Link>,
          ])}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-[12.5px] text-muted">
          <span>© {new Date().getFullYear()} WeddingStay. All rights reserved.</span>
          <span className="flex gap-4"><Link className={a} to="/terms">Terms</Link><Link className={a} to="/privacy">Privacy</Link></span>
        </div>
      </div>
    </footer>
  )
}
