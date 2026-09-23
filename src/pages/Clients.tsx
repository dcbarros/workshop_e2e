import { useEffect, useMemo, useState } from 'react'
import { deleteClient, listClients } from '../services/clientService'
import type { Client } from '../types'
import { formatCpf, shortDate } from '../utils/formatters'

interface ClientsProps { navigate: (path: string) => void }

export function Clients({ navigate }: ClientsProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try { setClients(await listClients()) }
    catch { setError('Não foi possível carregar os clientes.') }
    finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => clients.filter((client) =>
    client.name.includes(query) || client.cpf.includes(query.replace(/\D/g, '')) || client.address.city.includes(query)
  ), [clients, query])

  async function remove(client: Client) {
    if (!window.confirm(`Excluir o cadastro de ${client.name}?`)) return
    await deleteClient(client.cpf)
    await load()
  }

  return (
    <div className="page">
      <header className="page-header">
        <div><span className="eyebrow">Cadastros</span><h1>Clientes</h1><p>Consulte, edite e valide os registros disponíveis.</p></div>
        <button className="button button--primary" onClick={() => navigate('/clientes/novo')} data-cy="new-client">+ Novo cliente</button>
      </header>
      <section className="panel table-panel">
        <div className="table-toolbar">
          <label className="search-field"><span aria-hidden="true">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome, CPF ou cidade" data-cy="client-search" /></label>
          <span className="result-count">{filtered.length} resultado(s)</span>
        </div>
        {error ? <div className="alert alert--error">{error}</div> : null}
        <div className="table-scroll">
          <table data-cy="clients-table">
            <thead><tr><th>Cliente</th><th>CPF</th><th>Tipo</th><th>Cidade</th><th>Atualizado</th><th className="actions-cell">Ações</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="empty-state">Carregando clientes…</td></tr> : null}
              {!loading && filtered.length === 0 ? <tr><td colSpan={6} className="empty-state">Nenhum cliente encontrado.</td></tr> : null}
              {!loading && filtered.map((client) => (
                <tr key={client.cpf} data-cy="client-row">
                  <td><strong>{client.name}</strong><small>{client.email || 'Sem e-mail'}</small></td>
                  <td>{formatCpf(client.cpf)}</td>
                  <td><div className="tag-wrap">{client.clientTypes.map((type) => <span className="tag" key={type}>{type.replace('Pessoa ', '')}</span>)}</div></td>
                  <td>{client.address.city || '—'}</td>
                  <td>{shortDate(client.updatedAt)}</td>
                  <td className="actions-cell"><button className="icon-button" title="Editar cliente" onClick={() => navigate(`/clientes/${client.cpf}/editar`)}>✎</button><button className="icon-button icon-button--danger" title="Excluir cliente" onClick={() => void remove(client)}>⌫</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
