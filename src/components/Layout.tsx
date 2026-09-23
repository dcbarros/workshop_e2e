import type { ReactNode } from 'react'
import { logout } from '../services/authService'

interface LayoutProps {
  children: ReactNode
  route: string
  navigate: (path: string) => void
}

export function Layout({ children, route, navigate }: LayoutProps) {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '▦' },
    { path: '/clientes', label: 'Clientes', icon: '◉' },
    { path: '/clientes/novo', label: 'Novo cadastro', icon: '+' },
    { path: '/atendimentos', label: 'Atendimentos', icon: '▤' }
  ]

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => navigate('/dashboard')} aria-label="Ir para dashboard">
          <span className="brand__mark">CL</span>
          <span><strong>ClientLab</strong><small>Workshop QA</small></span>
        </button>
        <nav className="nav" aria-label="Navegação principal">
          {navItems.map((item) => {
            const active = item.path === '/clientes' ? route === '/clientes' : route.startsWith(item.path)
            return (
              <button
                key={item.path}
                className={`nav__item ${active ? 'nav__item--active' : ''}`}
                onClick={() => navigate(item.path)}
                data-cy={`nav-${item.path.replaceAll('/', '').replace('clientesnovo', 'novo-cliente') || 'home'}`}
              >
                <span className="nav__icon">{item.icon}</span>{item.label}
              </button>
            )
          })}
        </nav>
        <div className="sidebar__footer">
          <div className="profile-chip"><span className="avatar">QA</span><span><strong>Agente QA</strong><small>Ambiente de workshop</small></span></div>
          <button className="link-button" onClick={() => { logout(); navigate('/login') }} data-cy="logout">Sair</button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  )
}
