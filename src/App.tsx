import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import ArchivePage from './pages/ArchivePage'
import HelpPage from './pages/HelpPage'
import MockPage from './pages/MockPage'
import QuestionsPage from './pages/QuestionsPage'
import RecordPage from './pages/RecordPage'
import ReviewPage from './pages/ReviewPage'
import RoadmapPage from './pages/RoadmapPage'
import SettingsPage from './pages/SettingsPage'
import ShadowingPage from './pages/ShadowingPage'
import TodayPage from './pages/TodayPage'
import UnitPage from './pages/UnitPage'
import UnitsPage from './pages/UnitsPage'
import { AppProvider } from './state/AppProvider'

// Charts pull in recharts; load them only when the Progress page is opened.
const ProgressPage = lazy(() => import('./pages/ProgressPage'))

export default function App() {
  return (
    <AppProvider>
      {/* HashRouter: GitHub Pages has no SPA fallback, so deep links must not hit the server. */}
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<TodayPage />} />
            <Route path="units" element={<UnitsPage />} />
            <Route path="units/:id" element={<UnitPage />} />
            <Route path="review" element={<ReviewPage />} />
            <Route path="roadmap" element={<RoadmapPage />} />
            <Route path="record" element={<RecordPage />} />
            <Route path="shadowing" element={<ShadowingPage />} />
            <Route path="questions" element={<QuestionsPage />} />
            <Route path="mock" element={<MockPage />} />
            <Route path="archive" element={<ArchivePage />} />
            <Route
              path="progress"
              element={
                <Suspense fallback={<div className="skeleton" style={{ height: 320, borderRadius: 26 }} aria-busy="true" />}>
                  <ProgressPage />
                </Suspense>
              }
            />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="*" element={<TodayPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  )
}
