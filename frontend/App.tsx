import { useEffect } from 'react'
import { HashRouter, MemoryRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppShell from './components/AppShell'
import Functions from './pages/Functions'
import GuestForm from './pages/GuestForm'
import GuestStay, { GuestDone } from './pages/GuestStay'
import Guests from './pages/Guests'
import Landing from './pages/Landing'
import { Privacy, Terms } from './pages/Legal'
import Home from './pages/Home'
import Rooms from './pages/Rooms'
import RsvpDesign from './pages/RsvpDesign'
import Start from './pages/Start'
import Settings from './pages/Settings'
import { StoreProvider } from './store'
import { Demo, GuestRoute, OpenWedding, SaveLink } from './pages/Open'
import { AuthReturn, Join, MyWeddings, SignIn } from './pages/Account'

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
        <AuthReturn />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/register" element={<SignIn register />} />
          <Route path="/me" element={<MyWeddings />} />
          <Route path="/join/:code" element={<Join />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/start" element={<Start />} />
          <Route path="/w/:token" element={<OpenWedding />} />
          <Route path="/h/:token" element={<OpenWedding helper />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Home />} />
            <Route path="guests" element={<Guests />} />
            <Route path="invitations" element={<Navigate to="/app/guests" replace />} />
            <Route path="invitations/design" element={<RsvpDesign />} />
            <Route path="functions" element={<Functions />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="accommodation/*" element={<Navigate to="/app/rooms" replace />} />
            <Route path="settings" element={<Settings />} />
            <Route path="link" element={<SaveLink />} />
          </Route>
          <Route path="/g/:householdId" element={<GuestRoute><GuestForm /></GuestRoute>} />
          <Route path="/g/:householdId/done" element={<GuestRoute><GuestDone /></GuestRoute>} />
          <Route path="/g/:householdId/stay" element={<GuestRoute><GuestStay /></GuestRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </StoreProvider>
  )
}
