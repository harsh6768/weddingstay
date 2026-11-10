import { UserPlus } from 'lucide-react'
import { PageHeader, Pill, Section } from '../components/ui'
import { sideLabel } from '../lib/stats'
import { useStore } from '../store'

export default function Settings() {
  const { data, dispatch } = useStore()
  return (
    <>
      <PageHeader title="Settings" subtitle="Who can see and edit this wedding." actions={<button className="btn-primary"><UserPlus size={16} /> Invite coordinator</button>} />
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Section title="Team and access">
          <ul className="divide-y divide-line">
            {data.members.map((m) => {
              const n = data.households.filter((h) => h.coordinatorId === m.id).length
              return (
                <li key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="h-9 w-9 rounded-full bg-plumsoft text-plum grid place-items-center font-semibold">{m.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{m.name}</div>
                    <div className="text-[12.5px] text-muted">{m.role === 'OWNER' ? 'Owner · sees and edits everything' : n ? `Coordinator · ${n} ${m.side ? sideLabel[m.side].toLowerCase() : ''} families assigned` : 'Coordinator · no families assigned yet'}</div>
                  </div>
                  {m.status === 'INVITED' ? <Pill tone="info">Invite pending</Pill> : <Pill tone={m.role === 'OWNER' ? 'plum' : 'neutral'}>{m.role === 'OWNER' ? 'Owner' : 'Coordinator'}</Pill>}
                </li>
              )
            })}
          </ul>
        </Section>
        <div className="flex flex-col gap-5">
          <Section title="Wedding">
            <dl className="p-4 grid grid-cols-2 gap-3 text-[13.5px]">
              <div><dt className="eyebrow">Couple</dt><dd>{data.wedding.brideName} &amp; {data.wedding.groomName}</dd></div>
              <div><dt className="eyebrow">City</dt><dd>{data.wedding.city}</dd></div>
              <div><dt className="eyebrow">Dates</dt><dd>11 to 13 Dec 2026</dd></div>
              <div><dt className="eyebrow">Timezone</dt><dd>India (IST)</dd></div>
              <div><dt className="eyebrow">Responses close</dt><dd>25 Nov 2026</dd></div>
              <div><dt className="eyebrow">Guest data kept</dt><dd>90 days after wedding</dd></div>
            </dl>
          </Section>
          <Section title="Prototype">
            <div className="p-4 text-[13.5px] text-muted">
              <p>Everything here is sample data held in your browser tab.</p>
              <button className="btn-ghost mt-3" onClick={() => dispatch({ type: 'reset' })}>Reset sample data</button>
            </div>
          </Section>
        </div>
      </div>
    </>
  )
}
