import {
  Archive,
  Briefcase,
  CircleHelp,
  GraduationCap,
  Headphones,
  House,
  Library,
  Map as MapIcon,
  Menu,
  Mic,
  Moon,
  Settings,
  Sun,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { REPO_URL } from '../config'
import { useApp } from '../hooks/useApp'
import { useI18n } from '../hooks/useI18n'
import type { Messages } from '../i18n'

interface NavItem {
  to: string
  icon: LucideIcon
  label: (t: Messages) => string
  end?: boolean
}

const MAIN: NavItem[] = [
  { to: '/', icon: House, label: (t) => t.nav.today, end: true },
  { to: '/units', icon: GraduationCap, label: (t) => t.nav.units },
  { to: '/roadmap', icon: MapIcon, label: (t) => t.nav.roadmap },
  { to: '/shadowing', icon: Headphones, label: (t) => t.nav.shadowing },
  { to: '/questions', icon: Library, label: (t) => t.nav.questions },
  { to: '/mock', icon: Briefcase, label: (t) => t.nav.mock },
  { to: '/archive', icon: Archive, label: (t) => t.nav.archive },
  { to: '/progress', icon: TrendingUp, label: (t) => t.nav.progress },
]

/** Phone bottom bar shows the five daily destinations (short labels); the rest live in the "More" menu. */
const TABBAR: NavItem[] = [
  { to: '/', icon: House, label: (t) => t.tabs.today, end: true },
  { to: '/units', icon: GraduationCap, label: (t) => t.tabs.units },
  { to: '/shadowing', icon: Headphones, label: (t) => t.tabs.shadowing },
  { to: '/questions', icon: Library, label: (t) => t.tabs.questions },
  { to: '/archive', icon: Archive, label: (t) => t.tabs.archive },
]

const MORE: NavItem[] = [
  { to: '/roadmap', icon: MapIcon, label: (t) => t.nav.roadmap },
  { to: '/mock', icon: Briefcase, label: (t) => t.nav.mock },
  { to: '/progress', icon: TrendingUp, label: (t) => t.nav.progress },
  { to: '/settings', icon: Settings, label: (t) => t.nav.settings },
  { to: '/help', icon: CircleHelp, label: (t) => t.nav.help },
]

export function Layout() {
  const { settings, updateSettings } = useApp()
  const { t } = useI18n()
  const location = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)
  const isDark = settings.theme === 'dark'

  // HashRouter keeps the old scroll position; start every screen at the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        {t.nav.skip}
      </a>
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand" aria-label="SpeakDaily">
            <span className="brand-mark" aria-hidden>
              <Mic size={19} strokeWidth={2.6} />
            </span>
            SpeakDaily
          </NavLink>

          <nav className="nav" aria-label={t.nav.main}>
            {MAIN.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} title={item.label(t)}>
                <item.icon size={16} aria-hidden />
                <span className="nav-label">{item.label(t)}</span>
              </NavLink>
            ))}
          </nav>

          <div className="topbar-actions">
            <NavLink to="/help" className="icon-btn desktop-only" title={t.nav.help} aria-label={t.nav.help}>
              <CircleHelp size={20} />
            </NavLink>
            <button
              type="button"
              className="icon-btn"
              onClick={() => updateSettings({ language: settings.language === 'tr' ? 'en' : 'tr' })}
              title={t.header.switchLanguage}
              aria-label={t.header.switchLanguage}
              lang={settings.language === 'tr' ? 'en' : 'tr'}
            >
              {t.header.otherLanguageCode}
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => updateSettings({ theme: isDark ? 'light' : 'dark' })}
              title={isDark ? t.header.toLight : t.header.toDark}
              aria-label={isDark ? t.header.toLight : t.header.toDark}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <NavLink to="/settings" className="icon-btn desktop-only" title={t.nav.settings} aria-label={t.nav.settings}>
              <Settings size={20} />
            </NavLink>
            <details className="more-menu mobile-only" open={moreOpen} onToggle={(e) => setMoreOpen(e.currentTarget.open)}>
              <summary className="icon-btn" aria-label={t.nav.more} title={t.nav.more}>
                <Menu size={20} />
              </summary>
              <div className="more-panel">
                {MORE.map((item) => (
                  <NavLink key={item.to} to={item.to} onClick={() => setMoreOpen(false)}>
                    <item.icon size={18} aria-hidden />
                    {item.label(t)}
                  </NavLink>
                ))}
              </div>
            </details>
          </div>
        </div>
      </header>

      <main id="main" className="main">
        <div className="page" key={location.pathname}>
          <Outlet />
        </div>
      </main>

      <footer className="footer">
        {t.footer.local} ·{' '}
        <a href={REPO_URL} target="_blank" rel="noreferrer">
          {t.footer.source}
        </a>
      </footer>

      <nav className="tabbar" aria-label={t.nav.main}>
        {TABBAR.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}>
            <item.icon size={22} aria-hidden />
            {item.label(t)}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
