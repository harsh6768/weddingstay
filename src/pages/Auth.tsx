import { ArrowRight, Check, Eye, EyeOff, MessageCircle } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mark } from '../components/AppShell'
import { Mandala, Toran } from '../components/Ornaments'
import { gutter } from '../components/Site'

// Sign up and log in. UI only for now: any details go straight to the sample wedding.

export function Register() {
  const nav = useNavigate()
  const [role, setRole] = useState('Bride')
  const [agree, setAgree] = useState(false)
  const submit = (e: FormEvent) => { e.preventDefault(); if (agree) nav('/start') }
  return (
    <AuthLayout title="Create your wedding" sub={<>Already have an account? <Link to="/login" className="font-medium text-plum hover:underline">Log in</Link></>}>
      <GoogleButton label="Sign up with Google" to="/start" />
      <Or />
      <form onSubmit={submit} className="grid gap-4">
        <Field label="Your name"><input className="input" required autoComplete="name" placeholder="Ananya Iyer" /></Field>
        <Field label="You are the">
          <div className="flex flex-wrap gap-2">
            {['Bride', 'Groom', 'Family member', 'Wedding planner'].map((r) => (
              <button type="button" key={r} onClick={() => setRole(r)} aria-pressed={role === r}
                className={`rounded-full border px-3.5 py-2 text-[13.5px] ${role === r ? 'border-plum bg-plumsoft text-plum font-medium' : 'border-line hover:bg-sunk'}`}>{r}</button>
            ))}
          </div>
        </Field>
        <Field label="Mobile number">
          <div className="flex gap-2">
            <span className="input !w-auto shrink-0 text-muted">+91</span>
            <input className="input" required inputMode="tel" autoComplete="tel-national" placeholder="98765 43210" />
          </div>
        </Field>
        <Field label="Email"><input className="input" type="email" required autoComplete="email" placeholder="you@example.com" /></Field>
        <Password label="Create a password" autoComplete="new-password" hint="At least 8 characters." />
        <label className="flex items-start gap-2.5 text-[13.5px] leading-snug text-muted">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[rgb(var(--plum))]" required />
          <span>I agree to the <Link to="/terms" className="font-medium text-plum hover:underline">Terms and Conditions</Link> and the <Link to="/privacy" className="font-medium text-plum hover:underline">Privacy Policy</Link>.</span>
        </label>
        <button type="submit" className="btn-primary !py-3 text-[15px]" disabled={!agree} style={{ opacity: agree ? 1 : 0.55 }}>Create my account <ArrowRight size={17} /></button>
      </form>
    </AuthLayout>
  )
}

export function Login() {
  const nav = useNavigate()
  const [mode, setMode] = useState<'password' | 'otp'>('password')
  const [sent, setSent] = useState(false)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (mode === 'otp' && !sent) { setSent(true); return }
    nav('/app')
  }
  return (
    <AuthLayout title="Welcome back" sub={<>New to WeddingStay? <Link to="/register" className="font-medium text-plum hover:underline">Create an account</Link></>}>
      <GoogleButton label="Continue with Google" />
      <Or />
      <div className="mb-4 grid grid-cols-2 rounded-full bg-sunk p-1 text-[13.5px] font-medium">
        {([['password', 'Password'], ['otp', 'Code on WhatsApp']] as const).map(([m, l]) => (
          <button key={m} type="button" onClick={() => { setMode(m); setSent(false) }} className={`rounded-full py-2 ${mode === m ? 'bg-surface shadow-sm text-ink' : 'text-muted'}`}>{l}</button>
        ))}
      </div>
      <form onSubmit={submit} className="grid gap-4">
        {mode === 'password' ? (
          <>
            <Field label="Mobile number or email"><input className="input" required autoComplete="username" placeholder="98765 43210 or you@example.com" /></Field>
            <Password label="Password" autoComplete="current-password" extra={<button type="button" className="text-[13px] font-medium text-plum hover:underline">Forgot password?</button>} />
          </>
        ) : (
          <>
            <Field label="Mobile number">
              <div className="flex gap-2">
                <span className="input !w-auto shrink-0 text-muted">+91</span>
                <input className="input" required inputMode="tel" autoComplete="tel-national" placeholder="98765 43210" />
              </div>
            </Field>
            {sent && (
              <Field label="6-digit code">
                <input className="input tracking-[0.5em] text-center num" inputMode="numeric" maxLength={6} autoComplete="one-time-code" placeholder="••••••" autoFocus />
                <div className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-good"><MessageCircle size={14} /> We sent a code to your WhatsApp.</div>
              </Field>
            )}
          </>
        )}
        <label className="flex items-center gap-2.5 text-[13.5px] text-muted">
          <input type="checkbox" defaultChecked className="h-4 w-4 accent-[rgb(var(--plum))]" /> Keep me logged in on this device
        </label>
        <button type="submit" className="btn-primary !py-3 text-[15px]">{mode === 'otp' && !sent ? 'Send me a code' : 'Log in'} <ArrowRight size={17} /></button>
      </form>
    </AuthLayout>
  )
}

function AuthLayout({ title, sub, children }: { title: string; sub: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col" style={gutter}>
        <div className="mx-auto w-full max-w-[440px] flex items-center justify-between py-5">
          <Link to="/" className="flex items-center gap-2"><Mark className="h-7 w-7" /><span className="font-display text-[20px] font-semibold">WeddingStay</span></Link>
          <Link to="/" className="text-[13.5px] text-muted hover:text-ink">Back to home</Link>
        </div>
        <main className="mx-auto w-full max-w-[440px] flex-1 py-6 md:py-10">
          <h1 className="rise font-display text-[40px] md:text-[48px] leading-[1] font-semibold">{title}</h1>
          <p className="rise mt-3 text-[14.5px] text-muted" style={{ animationDelay: '80ms' }}>{sub}</p>
          <div className="rise mt-7" style={{ animationDelay: '160ms' }}>{children}</div>
          <p className="mt-6 text-center text-[12px] text-muted">Prototype: any details work and nothing is saved. You'll land in the sample wedding.</p>
        </main>
        <div className="mx-auto w-full max-w-[440px] flex gap-4 py-6 text-[12.5px] text-muted">
          <Link to="/terms" className="hover:text-ink">Terms</Link><Link to="/privacy" className="hover:text-ink">Privacy</Link>
        </div>
      </div>

      <aside className="relative hidden lg:flex flex-col justify-end overflow-hidden p-12 text-[rgb(255_247_232)]" style={{ background: 'radial-gradient(80% 60% at 70% 20%, rgb(128 22 48), rgb(62 16 30))' }}>
        <div className="absolute inset-x-0 top-0 flex justify-center" aria-hidden="true">
          {Array.from({ length: 3 }, (_, i) => <div key={i} className="w-[360px] shrink-0"><Toran swags={4} /></div>)}
        </div>
        <Mandala className="absolute -right-24 top-1/4 h-[460px] w-[460px] opacity-[0.12]" />
        <div className="relative max-w-[440px]">
          <div className="font-script text-[64px] leading-none text-[rgb(246_172_64)]">Shubh Vivah</div>
          <h2 className="mt-4 font-display text-[36px] leading-[1.05] font-semibold">Every family answered. Every room placed.</h2>
          <ul className="mt-6 grid gap-3 text-[15px] text-[rgb(255_247_232/0.85)]">
            {['One WhatsApp link per family, no app for guests', 'Live headcount for every function', 'Hotel rooms planned night by night'].map((t) => (
              <li key={t} className="flex items-center gap-2.5"><span className="grid h-6 w-6 place-items-center rounded-full bg-[rgb(255_247_232/0.12)]"><Check size={14} /></span>{t}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}

function Password({ label, autoComplete, hint, extra }: { label: string; autoComplete: string; hint?: string; extra?: ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between"><span className="label !mb-0">{label}</span>{extra}</div>
      <div className="relative">
        <input className="input !pr-11" type={show ? 'text' : 'password'} required minLength={8} autoComplete={autoComplete} placeholder="••••••••" />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-sunk">
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {hint && <div className="mt-1.5 text-[12.5px] text-muted">{hint}</div>}
    </div>
  )
}

function GoogleButton({ label, to = '/app' }: { label: string; to?: string }) {
  const nav = useNavigate()
  return (
    <button type="button" onClick={() => nav(to)} className="btn-ghost w-full !py-3 text-[15px]">
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      {label}
    </button>
  )
}

function Or() {
  return <div className="my-5 flex items-center gap-3 text-[12.5px] text-muted"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><div className="label">{label}</div>{children}</div>
}
