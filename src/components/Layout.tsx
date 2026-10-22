import { NavLink, Outlet } from 'react-router-dom'

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
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
