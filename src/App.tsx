import { useEffect, useState } from 'react'
import { Layout } from './components/Layout'
import { isAuthenticated } from './services/authService'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Clients } from './pages/Clients'
import { ClientForm } from './pages/ClientForm'
import { Interactions } from './pages/Interactions'

function normalizeHash(): string {
  return window.location.hash.replace(/^#/, '') || '/login'
}

export default function App() {
  const [route, setRoute] = useState(normalizeHash())

  useEffect(() => {
    const listener = () => setRoute(normalizeHash())
    window.addEventListener('hashchange', listener)
    if (!window.location.hash) window.location.hash = '#/login'
    return () => window.removeEventListener('hashchange', listener)
  }, [])

  function navigate(path: string) {
    window.location.hash = `#${path}`
  }

  const authenticated = isAuthenticated()
  if (!authenticated && route !== '/login') {
    if (window.location.hash !== '#/login') window.location.hash = '#/login'
    return <Login navigate={navigate} />
  }

  if (route === '/login') {
    if (authenticated) {
      if (window.location.hash !== '#/dashboard') window.location.hash = '#/dashboard'
      return null
    }
    return <Login navigate={navigate} />
  }

  let page = <Dashboard navigate={navigate} />
  if (route === '/clientes') page = <Clients navigate={navigate} />
  else if (route === '/atendimentos') page = <Interactions />
  else if (route === '/clientes/novo') page = <ClientForm navigate={navigate} />
  else {
    const match = route.match(/^\/clientes\/(\d+)\/editar$/)
    if (match) page = <ClientForm cpf={match[1]} navigate={navigate} />
  }

  return <Layout route={route} navigate={navigate}>{page}</Layout>
}
