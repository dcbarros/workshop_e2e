import { useState, type FormEvent } from 'react'
import { login } from '../services/authService'

interface LoginProps { navigate: (path: string) => void }

export function Login({ navigate }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const ok = await login(username, password)
      if (ok) navigate('/dashboard')
      else setError('Usuário ou senha inválidos.')
    } catch {
      setError('Não foi possível concluir o login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <section className="login-hero">
        <div className="login-hero__content">
          <div className="brand brand--light"><span className="brand__mark">CL</span><span><strong>ClientLab</strong><small>Workshop QA</small></span></div>
          <h1>Automação E2E em uma aplicação que parece real.</h1>
          <p>Cadastros, tabelas, upload, validações e fluxos suficientes para evoluir uma suíte Cypress do primeiro teste até a organização sustentável.</p>
          <div className="hero-card"><span>Ambiente local</span><strong>Dados isolados no navegador</strong><small>Use, quebre, restaure e teste novamente.</small></div>
        </div>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <div><span className="eyebrow">Acesso ao ambiente</span><h2>Entrar</h2><p>Use uma conta de demonstração para iniciar.</p></div>
          <label className="field">
            <span className="field__label">Usuário</span>
            <input id="username" className="field__control" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Seu usuário" autoComplete="username" />
          </label>
          <label className="field">
            <span className="field__label">Senha</span>
            <input id="password" className="field__control" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Sua senha" autoComplete="current-password" />
          </label>
          {error ? <div className="alert alert--error" data-cy="login-error" role="alert">{error}</div> : null}
          <button className="button button--primary button--full" type="submit" disabled={loading} data-cy="login-submit">{loading ? 'Entrando…' : 'Entrar'}</button>
          <div className="demo-credentials"><strong>Conta de demonstração</strong><span>Usuário: <code>qa.workshop</code></span><span>Senha: <code>cypress123</code></span></div>
        </form>
      </section>
    </div>
  )
}
