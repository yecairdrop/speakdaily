import { NavLink, Outlet } from 'react-router-dom'
import { REPO_URL } from '../config'
import { useApp } from '../hooks/useApp'

const NAV = [
  { to: '/', label: 'Today', end: true },
  { to: '/roadmap', label: 'Roadmap' },
  { to: '/shadowing', label: 'Shadowing' },
  { to: '/questions', label: 'Questions' },
  { to: '/mock', label: 'Mock interview' },
  { to: '/archive', label: 'Archive' },
  { to: '/progress', label: 'Progress' },
  { to: '/settings', label: 'Settings' },
]

export function Layout() {
  const { settings, updateSettings } = useApp()
  const nextTheme = settings.theme === 'dark' ? 'light' : 'dark'
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand">
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" />
            SpeakDaily
          </NavLink>
          <nav className="nav" aria-label="Main">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className="btn btn-sm btn-ghost theme-toggle"
            onClick={() => updateSettings({ theme: nextTheme })}
            aria-label={`Switch to ${nextTheme} mode`}
            title={`Switch to ${nextTheme} mode`}
          >
            {settings.theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        SpeakDaily · your recordings never leave this browser ·{' '}
        <a href={REPO_URL} target="_blank" rel="noreferrer">
          source on GitHub
        </a>
      </footer>
    </div>
  )
}
