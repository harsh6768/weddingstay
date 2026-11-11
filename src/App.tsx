import { useEffect } from 'react'
import { HashRouter, MemoryRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppShell from './components/AppShell'
import Allocation from './pages/Allocation'
import Functions from './pages/Functions'
import GuestForm from './pages/GuestForm'
import GuestStay, { GuestDone } from './pages/GuestStay'
import Guests from './pages/Guests'
import Hotels from './pages/Hotels'
import Invitations from './pages/Invitations'
import Landing from './pages/Landing'
import Overview from './pages/Overview'
import Requirements from './pages/Requirements'
import Rooming from './pages/Rooming'
import Settings from './pages/Settings'
import { StoreProvider } from './store'

// The single-file preview runs inside a sandboxed frame, so it keeps routes in memory.
const Router = import.meta.env.MODE === 'preview' ? MemoryRouter : HashRouter

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <StoreProvider>
      <Router {...(import.meta.env.MODE === 'preview' ? { initialEntries: [import.meta.env.VITE_START_PATH || '/'] } : {})}>
        <ScrollTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Overview />} />
            <Route path="guests" element={<Guests />} />
            <Route path="invitations" element={<Invitations />} />
            <Route path="functions" element={<Functions />} />
            <Route path="accommodation" element={<Hotels />} />
            <Route path="accommodation/requirements" element={<Requirements />} />
            <Route path="accommodation/allocation" element={<Allocation />} />
            <Route path="accommodation/rooming" element={<Rooming />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/g/:householdId" element={<GuestForm />} />
          <Route path="/g/:householdId/done" element={<GuestDone />} />
          <Route path="/g/:householdId/stay" element={<GuestStay />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </StoreProvider>
  )
}
