import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SiteFooter, SiteHeader, gutter, wrap } from '../components/Site'

// Terms and Privacy. Draft wording for the prototype: have a lawyer review before launch.

type Sec = [id: string, title: string, body: ReactNode]
const UPDATED = '16 November 2026'

export function Terms() {
  const s: Sec[] = [
    ['about', 'About these terms', <>
      <p>These terms are an agreement between you and WeddingStay (“we”, “us”) for using the WeddingStay website and app (the “Service”). By creating an account or using the Service, you agree to them. If you use the Service for someone else, such as a couple you plan for, you confirm you may accept these terms for them.</p></>],
    ['accounts', 'Your account', <>
      <p>You need an account to create a wedding. Give accurate details and keep your password and login codes private. You are responsible for what happens under your account. Tell us straight away if you think someone else has used it.</p>
      <p>Guests who answer an invite link do not need an account. Anyone with a family’s link can open it, so share links only with that family.</p></>],
    ['use', 'Using the Service', <>
      <p>You may use the Service to plan your own wedding or, as a planner, weddings you are hired for. You must not:</p>
      <ul><li>upload guest details you have no right to share;</li><li>send messages that are spam, abusive, or unlawful;</li><li>try to break, overload or get around the security of the Service;</li><li>copy or resell the Service without our written permission.</li></ul></>],
    ['content', 'Your content and guest data', <>
      <p>You own the guest lists, messages and other content you add. You give us permission to store and process it only to run the Service for you. You are responsible for having a lawful basis to share guests’ details with us, for example their consent or your relationship with them.</p>
      <p>How we handle personal data is set out in our <Link to="/privacy">Privacy Policy</Link>.</p></>],
    ['hotels', 'Hotels, rooms and third parties', <>
      <p>WeddingStay helps you plan rooms. It does not book or pay for rooms on your behalf. Room blocks, prices, deposits and cancellations are agreed between you and each hotel, and the hotel’s own terms apply. We are not responsible for a hotel’s or vendor’s acts or omissions.</p></>],
    ['fees', 'Fees', <>
      <p>The Service is free during early access. If we introduce paid plans, we will show prices before you are charged and you can choose not to upgrade. Fees are in Indian rupees and include GST where it applies.</p></>],
    ['availability', 'Availability and changes', <>
      <p>We work to keep the Service running but cannot promise it will always be available or error-free. We may change or stop features. If we make a change that materially affects you, we will tell you in advance where we reasonably can.</p></>],
    ['liability', 'Liability', <>
      <p>To the extent the law allows, the Service is provided “as is” and we are not liable for indirect or consequential losses, or for losses caused by information you or your guests enter. Our total liability for any claim is limited to the amount you paid us in the 12 months before the claim. Nothing in these terms limits liability that cannot be limited by law.</p></>],
    ['ending', 'Closing your account', <>
      <p>You can close your account at any time from Settings. We may suspend or close an account that breaks these terms. After closing, we delete your wedding data as described in the Privacy Policy.</p></>],
    ['law', 'Governing law', <>
      <p>These terms are governed by the laws of India. Courts in Bengaluru, Karnataka have jurisdiction over disputes, subject to any rights you have as a consumer.</p></>],
    ['contact', 'Contact', <><p>Questions about these terms? Write to us from the Help section of your account.</p></>],
  ]
  return <LegalPage title="Terms and Conditions" intro="The rules for using WeddingStay, in plain language." sections={s} />
}

export function Privacy() {
  const s: Sec[] = [
    ['summary', 'In short', <>
      <ul><li>We collect what we need to run your wedding: your account details and the guest information you add.</li><li>We never sell personal data or use guest lists for advertising.</li><li>You can download or delete your wedding data at any time.</li></ul></>],
    ['collect', 'What we collect', <>
      <p><strong>From you:</strong> name, mobile number, email, your role in the wedding, and login details.</p>
      <p><strong>About your guests</strong>, added by you or by the guest through their link: names, family groups, which functions they will attend, travel and arrival details, room needs, dietary needs and phone numbers.</p>
      <p><strong>Automatically:</strong> basic device and usage information, such as browser type and pages visited, to keep the Service secure and working.</p></>],
    ['use', 'How we use it', <>
      <p>To run the Service: show your dashboard, send invite links, calculate headcounts, plan rooms and prepare rooming lists. To keep accounts secure, fix problems, and contact you about your account. We do not use guests’ details to market to them.</p></>],
    ['share', 'Who we share it with', <>
      <p>Only with people and services that help run your wedding:</p>
      <ul><li>coordinators you add to your wedding;</li><li>hotels, when you choose to send them a rooming list;</li><li>service providers that host our data or send messages for us, under contracts that protect it;</li><li>authorities, where the law requires it.</li></ul></>],
    ['guests', 'A note for guests', <>
      <p>If you received an invite link, the couple or their family added your details and are responsible for them. Your link shows only your family’s details. You can ask the couple, or us, to correct or remove your information.</p></>],
    ['rights', 'Your rights', <>
      <p>Under India’s Digital Personal Data Protection Act, 2023, you can ask to access, correct or erase your personal data, withdraw consent, and nominate someone to act for you. You can also raise a grievance with us and, if unresolved, with the Data Protection Board of India.</p></>],
    ['retention', 'How long we keep it', <>
      <p>We keep wedding data while your account is open. Six months after the last function date we offer to archive the wedding; you can delete it sooner from Settings. Deleted data is removed from backups within 30 days.</p></>],
    ['security', 'Security', <>
      <p>Data is encrypted in transit and at rest, invite links are long and hard to guess, and staff access is limited and logged. No system is perfectly secure, so tell us if you notice anything unusual.</p></>],
    ['changes', 'Changes to this policy', <><p>We will post any changes here and update the date above. If a change is significant, we will tell you by email or in the app.</p></>],
    ['contact', 'Contact and grievances', <><p>Write to our Grievance Officer from the Help section of your account. We respond within 30 days.</p></>],
  ]
  return <LegalPage title="Privacy Policy" intro="What we collect, why, and the choices you have." sections={s} />
}

function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: Sec[] }) {
  return (
    <div className="min-h-full">
      <SiteHeader />
      <div className={`${wrap} pt-12 md:pt-16 pb-20`} style={gutter}>
        <div className="eyebrow uppercase tracking-[0.18em] text-plum">Legal</div>
        <h1 className="mt-3 font-display text-[44px] md:text-[60px] leading-[1] font-semibold">{title}</h1>
        <p className="mt-4 text-[17px] text-muted">{intro}</p>
        <p className="mt-2 text-[13px] text-muted">Last updated {UPDATED}</p>
        <div className="mt-12 grid gap-12 lg:grid-cols-[240px_1fr]">
          <nav className="hidden lg:block">
            <ol className="sticky top-24 grid gap-1 border-l border-line text-[13.5px]">
              {sections.map(([id, t]) => (
                <li key={id}><button onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="-ml-px border-l border-transparent py-1 pl-4 text-left text-muted hover:border-plum hover:text-ink">{t}</button></li>
              ))}
            </ol>
          </nav>
          <article className="legal max-w-[68ch]">
            {sections.map(([id, t, body], i) => (
              <section key={id} id={id} className="scroll-mt-24 border-t border-line py-7 first:border-t-0 first:pt-0">
                <h2 className="font-display text-[26px] font-semibold"><span className="mr-2 text-gold num">{i + 1}.</span>{t}</h2>
                <div className="mt-3">{body}</div>
              </section>
            ))}
          </article>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
