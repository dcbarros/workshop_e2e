import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react'
import { CLIENT_INTERESTS } from '../data/seed'
import { getClient, lookupCep, saveClient } from '../services/clientService'
import type { Client, ClientType, PreferredContact, Relationship } from '../types'
import { Field } from '../components/Field'
import { digitsOnly, formatCpf } from '../utils/formatters'
import { ageFromDate, isFullName, isValidCpf, isValidEmail, parseBirthDate } from '../utils/validators'
import { downloadClientPdf } from '../utils/pdf'

interface ClientFormProps {
  cpf?: string
  navigate: (path: string) => void
}

type Errors = Record<string, string>

const emptyClient = (): Client => ({
  cpf: '', name: '', birthDate: '', phone: '', email: '', rg: '',
  address: { cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', country: '' },
  clientTypes: ['Pessoa física'], interests: [], preferredContact: 'Telefone', relationships: [], createdAt: '', updatedAt: ''
})

export function ClientForm({ cpf, navigate }: ClientFormProps) {
  const isEditing = Boolean(cpf)
  const [client, setClient] = useState<Client>(emptyClient())
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEditing)
  const [notice, setNotice] = useState('')
  const [relationshipDraft, setRelationshipDraft] = useState<Relationship>({ id: '', name: '', relation: '', contact: '' })
  const [relationshipErrors, setRelationshipErrors] = useState<Errors>({})
  const [editingRelationshipId, setEditingRelationshipId] = useState<string | null>(null)
  const [deleteRelationshipId, setDeleteRelationshipId] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const photoInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!cpf) return
    void (async () => {
      const found = await getClient(cpf)
      if (found) setClient(found)
      else setNotice('Cliente não encontrado.')
      setLoading(false)
    })()
  }, [cpf])

  const emailWarning = useMemo(() => client.email && !isValidEmail(client.email) ? 'E-mail inválido!' : '', [client.email])

  function set<K extends keyof Client>(key: K, value: Client[K]) {
    setClient((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [String(key)]: '' }))
  }

  function setAddress(key: keyof Client['address'], value: string) {
    setClient((current) => ({ ...current, address: { ...current.address, [key]: value } }))
  }

  function validate(): Errors {
    const next: Errors = {}
    if (!client.name.trim()) next.name = 'Campo Nome é obrigatório!'
    else if (!isFullName(client.name)) next.name = 'Nome inválido!'
    else if (client.name.length > 100) next.name = 'Nome inválido!'

    if (!client.cpf.trim()) next.cpf = 'Campo CPF é obrigatório!'
    else if (!isValidCpf(client.cpf)) next.cpf = 'CPF inválido!'

    if (client.birthDate) {
      const date = parseBirthDate(client.birthDate)
      if (!date) next.birthDate = 'Data inválida!'
      else {
        const age = ageFromDate(date)
        if (age < 16) next.birthDate = 'Cliente menor de 16 anos!'
        if (age > 100) next.birthDate = 'Cliente acima de 100 anos, precisa de cadastro especial com teste de sanidade mental. Entrar em contato com setor de cadastros!'
      }
    }

    if (client.phone.length >= 50) next.phone = 'Telefone deve possuir menos de 50 caracteres.'
    if (client.rg.length >= 50) next.rg = 'RG deve possuir menos de 50 caracteres.'
    if (client.address.cep.length >= 20) next.cep = 'CEP deve possuir menos de 20 caracteres.'
    if (client.clientTypes.length === 0) next.clientTypes = 'Selecione um ou mais tipo de clientes'
    return next
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setSaving(true)
    setNotice('')
    try {
      const normalized = { ...client, cpf: digitsOnly(client.cpf) }
      const saved = await saveClient(normalized, cpf)
      setClient(saved)
      setNotice('Cadastro salvo com sucesso.')
      if (!isEditing) window.setTimeout(() => navigate(`/clientes/${saved.cpf}/editar`), 500)
    } catch (error) {
      setErrors((current) => ({ ...current, cpf: error instanceof Error ? error.message : 'Erro ao salvar cadastro.' }))
    } finally { setSaving(false) }
  }

  async function handleCepBlur() {
    if (!client.address.cep.trim()) return
    setNotice('Consultando endereço…')
    try {
      const result = await lookupCep(client.address.cep)
      if (!result) { setNotice('CEP não encontrado ou formato incompatível com a consulta.'); return }
      setClient((current) => ({
        ...current,
        address: {
          ...current.address,
          street: result.street,
          neighborhood: result.neighborhood,
          city: result.city,
          state: result.state
        }
      }))
      setNotice('Endereço preenchido pela API pública. Você ainda pode editar os campos.')
    } catch {
      setNotice('Não foi possível consultar o serviço de CEP neste momento.')
    } finally {
      window.setTimeout(() => setNotice(''), 1800)
    }
  }

  function toggleClientType(type: ClientType) {
    setClient((current) => ({
      ...current,
      clientTypes: current.clientTypes.includes(type) ? current.clientTypes.filter((item) => item !== type) : [...current.clientTypes, type]
    }))
    setErrors((current) => ({ ...current, clientTypes: '' }))
  }

  function updateInterests(event: ChangeEvent<HTMLSelectElement>) {
    const values = Array.from(event.target.selectedOptions, (option) => option.value)
    setClient((current) => ({ ...current, interests: values }))
  }

  function validateRelationship(): boolean {
    const next: Errors = {}
    if (!relationshipDraft.name.trim()) next.name = 'Campo Nome é obrigatório!'
    else if (!isFullName(relationshipDraft.name)) next.name = 'Nome inválido!'
    if (!relationshipDraft.contact.trim()) next.contact = 'Campo Nome é obrigatório!'
    setRelationshipErrors(next)
    return Object.keys(next).length === 0
  }

  function saveRelationship() {
    if (!validateRelationship()) return
    const relationship: Relationship = { ...relationshipDraft, id: editingRelationshipId ?? `rel-${Date.now()}` }
    setClient((current) => ({
      ...current,
      relationships: editingRelationshipId
        ? current.relationships.map((item) => item.id === editingRelationshipId ? relationship : item)
        : [...current.relationships, relationship]
    }))
    setRelationshipDraft({ id: '', name: '', relation: '', contact: '' })
    setEditingRelationshipId(null)
    setRelationshipErrors({})
  }

  function editRelationship(item: Relationship) {
    setRelationshipDraft(item)
    setEditingRelationshipId(item.id)
    document.getElementById('relationship-editor')?.scrollIntoView({ behavior: 'smooth' })
  }

  function confirmDeleteRelationship() {
    if (!deleteRelationshipId) return
    setClient((current) => ({ ...current, relationships: current.relationships.filter((item) => item.id !== deleteRelationshipId) }))
    setDeleteRelationshipId(null)
  }

  function processPhoto(file?: File) {
    if (!file) return
    const allowed = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowed.includes(file.type)) { setErrors((current) => ({ ...current, photo: 'Imagem com formato inválido. Formatos aceitos: JPEG, JPG.' })); return }
    if (file.size > 2 * 1024 * 1024) { setErrors((current) => ({ ...current, photo: 'Imagem deve ser menor que 2MB' })); return }
    const reader = new FileReader()
    reader.onload = () => { set('photoDataUrl', String(reader.result)); setErrors((current) => ({ ...current, photo: '' })) }
    reader.readAsDataURL(file)
  }

  function onDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault(); setDragging(false); processPhoto(event.dataTransfer.files[0])
  }

  if (loading) return <div className="page"><div className="panel empty-state">Carregando cadastro…</div></div>

  return (
    <div className="page">
      <header className="page-header page-header--sticky">
        <div><span className="eyebrow">Clientes / {isEditing ? 'Editar' : 'Novo'}</span><h1>{isEditing ? 'Editar cliente' : 'Cadastro de cliente'}</h1><p>Preencha os dado do cliente e salve o registro localmente.</p></div>
        <div className="header-actions">
          {isEditing ? <button className="button button--secondary" type="button" onClick={() => downloadClientPdf(client)} data-cy="download-client">↓ Baixar PDF</button> : null}
          <button className="button button--ghost requirement-hidden-action" type="button" onClick={() => navigate('/clientes')} data-cy="cancel-client">Cancelar</button>
          <button className="button button--primary requirement-hidden-action" type="submit" form="client-form" disabled={saving} data-cy="save-client">{saving ? 'Salvando…' : 'Salvar cadastro'}</button>
        </div>
      </header>
      {notice ? <div className="toast" role="status">{notice}</div> : null}
      <form id="client-form" onSubmit={handleSubmit} noValidate>
        <section className="panel form-section">
          <div className="section-heading"><div><span className="section-index">01</span><h2>Dados pessoais</h2><p>Informações básica de identificação do cliente.</p></div></div>
          <div className="personal-grid">
            <div className="photo-column">
              <button type="button" className={`photo-dropzone ${dragging ? 'photo-dropzone--dragging' : ''}`} onClick={() => photoInput.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} data-cy="photo-upload">
                {client.photoDataUrl ? <img src={client.photoDataUrl} alt="Foto do cliente" /> : <><span className="photo-icon">◎</span><strong>Carregar foto</strong><small>Clique ou arraste o arquivo</small><em>JPEG/JPG • até 2 MB</em></>}
              </button>
              <input ref={photoInput} className="visually-hidden" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={(e: ChangeEvent<HTMLInputElement>) => processPhoto(e.target.files?.[0])} />
              {errors.photo ? <span className="upload-error" role="alert">{errors.photo}</span> : null}
            </div>
            <div className="form-grid form-grid--2">
              <Field label="Nome completo" required value={client.name} onChange={(e) => set('name', e.target.value)} error={errors.name} placeholder="Nome completo" maxLength={100} id="client-name" data-cy="client-name" className="span-2" />
              <Field label="Data de nascimento" value={client.birthDate} onChange={(e) => set('birthDate', e.target.value)} error={errors.birthDate} placeholder="DD/MM/AAAA" inputMode="numeric" maxLength={10} id="birth-date" />
              <Field label="Telefone" value={client.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} placeholder="Contato do cliente" maxLength={49} id="phone" />
              <Field label="E-mail" value={client.email} onChange={(e) => set('email', e.target.value)} warning={emailWarning} placeholder="seuemail@email.com" id="email" data-cy="client-email" />
              <Field label="CPF" required value={formatCpf(client.cpf)} onChange={(e) => set('cpf', digitsOnly(e.target.value).slice(0, 11))} error={errors.cpf} placeholder="000.000.000-00" inputMode="numeric" maxLength={14} id="cpf" data-cy="client-cpf" disabled={isEditing} />
              <Field label="RG" value={client.rg} onChange={(e) => set('rg', e.target.value)} error={errors.rg} placeholder="RG" maxLength={49} id="rg" />
            </div>
          </div>
        </section>

        <section className="panel form-section">
          <div className="section-heading"><div><span className="section-index">02</span><h2>Endereço</h2><p>Informe o CEP para buscar o endereço. Os campos preenchido automaticamente continuam editáveis.</p></div></div>
          <div className="form-grid form-grid--4">
            <Field label="CEP" value={client.address.cep} onChange={(e) => setAddress('cep', e.target.value)} onBlur={() => void handleCepBlur()} error={errors.cep} placeholder="CEP" maxLength={19} id="cep" data-cy="client-cep" />
            <Field label="Rua/Av." value={client.address.street} onChange={(e) => setAddress('street', e.target.value)} placeholder="Nome da rua ou avenida" maxLength={50} className="span-2" id="street" />
            <Field label="Número" value={client.address.number} onChange={(e) => setAddress('number', e.target.value)} placeholder="0000" maxLength={50} id="number" />
            <Field label="Complemento" value={client.address.complement} onChange={(e) => setAddress('complement', e.target.value)} placeholder="Apto, bloco…" maxLength={50} id="complement" />
            <Field label="Bairro" value={client.address.neighborhood} onChange={(e) => setAddress('neighborhood', e.target.value)} placeholder="Bairro" maxLength={30} id="neighborhood" />
            <Field label="Cidade" value={client.address.city} onChange={(e) => setAddress('city', e.target.value)} placeholder="Cidade" maxLength={50} id="city" data-cy="client-city" />
            <Field label="Estado" value={client.address.state} onChange={(e) => setAddress('state', e.target.value)} placeholder="UF" maxLength={20} id="state" />
            <Field label="País" value={client.address.country} onChange={(e) => setAddress('country', e.target.value)} placeholder="País" maxLength={50} id="country" className="span-2" data-cy="client-country" />
          </div>
        </section>

        <section className="panel form-section">
          <div className="section-heading"><div><span className="section-index">03</span><h2>Dados do cliente</h2><p>Classificação comercial e interesses associados.</p></div></div>
          <div className="choice-layout">
            <fieldset className="choice-group" title="Selecione um ou mais tipo de clientes">
              <legend>Tipo de cliente <span className="required">*</span></legend>
              <div className="choice-row">
                {(['Pessoa física', 'Pessoa jurídica'] as ClientType[]).map((type) => <label className="choice-card" key={type}><input type="checkbox" checked={client.clientTypes.includes(type)} onChange={() => toggleClientType(type)} /><span><strong>{type}</strong><small>{type === 'Pessoa física' ? 'Cadastro individual' : 'Cadastro empresarial'}</small></span></label>)}
              </div>
              {errors.clientTypes ? <span className="field__message" role="alert">{errors.clientTypes}</span> : null}
              <span className="field__hint">Selecione um ou mais tipo de clientes.</span>
            </fieldset>
            <fieldset className="choice-group" title="Selecione um ou mais interesses deste cliente">
              <legend>Interesses</legend>
              <select className="multi-select" multiple value={client.interests} onChange={updateInterests} data-cy="client-interests" aria-label="Interesses">
                {CLIENT_INTERESTS.map((interest) => <option key={interest} value={interest}>{interest}</option>)}
              </select>
              <span className="field__hint">Use Ctrl/Cmd para selecionar mais de uma opção.</span>
            </fieldset>
          </div>
          <fieldset className="choice-group contact-preference">
            <legend>Canal preferencial de contato</legend>
            <div className="radio-row" data-cy="preferred-contact">
              {(['Telefone', 'E-mail', 'WhatsApp'] as PreferredContact[]).map((channel) => (
                <label className="radio-card" key={channel}>
                  <input type="radio" name="preferred-contact" value={channel} checked={client.preferredContact === channel} onChange={() => set('preferredContact', channel)} />
                  <span>{channel}</span>
                </label>
              ))}
            </div>
            <span className="field__hint">Campo complementar do ClientLab usado para exercitar radio buttons no workshop.</span>
          </fieldset>
        </section>

        <section className="panel form-section" id="relationship-editor">
          <div className="section-heading section-heading--split"><div><span className="section-index">04</span><h2>Relacionamentos</h2><p>Contatos vinculados a este cliente.</p></div><span className="muted">{client.relationships.length} cadastrado(s)</span></div>
          <div className="relationship-editor">
            <Field label="Nome" value={relationshipDraft.name} onChange={(e) => setRelationshipDraft((current) => ({ ...current, name: e.target.value }))} error={relationshipErrors.name} placeholder="Nome completo" maxLength={50} id="relationship-name" />
            <Field label="Relação" value={relationshipDraft.relation} onChange={(e) => setRelationshipDraft((current) => ({ ...current, relation: e.target.value }))} placeholder="Ex.: Cônjuge" maxLength={30} id="relationship-relation" />
            <Field label="Contato" value={relationshipDraft.contact} onChange={(e) => setRelationshipDraft((current) => ({ ...current, contact: e.target.value }))} error={relationshipErrors.contact} placeholder="Telefone, e-mail…" maxLength={30} id="relationship-contact" />
            <button className="button button--secondary" type="button" onClick={saveRelationship} title="Adiciona um novo contato de relacionamento neste cliente." data-cy="relationship-add">{editingRelationshipId ? 'Salvar edição' : '+ Adicionar'}</button>
          </div>
          {client.relationships.length === 0 ? <div className="empty-inline">Nenhum relacionamento cadastrado.</div> : (
            <div className="table-scroll"><table className="compact-table"><thead><tr><th>Nome</th><th>Relação</th><th>Contato</th><th>Ações</th></tr></thead><tbody>{client.relationships.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.relation || '—'}</td><td>{item.contact}</td><td className="actions-cell"><button className="icon-button" type="button" title="Editar as informações de contato de relacionamento deste cliente." onClick={() => editRelationship(item)}>✎</button><button className="icon-button icon-button--danger" type="button" title="Excluir o contato de relacionamento deste cliente." onClick={() => setDeleteRelationshipId(item.id)}>⌫</button></td></tr>)}</tbody></table></div>
          )}
        </section>
      </form>

      {deleteRelationshipId ? <div className="modal-backdrop" role="presentation"><div className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-title"><span className="modal__icon">!</span><h2 id="delete-title">Deseja excluir este relacionamento?</h2><p>Esta alteração será efetivada quando o cadastro do cliente for salvo.</p><div className="modal__actions"><button className="button button--ghost" type="button" onClick={() => setDeleteRelationshipId(null)}>Cancelar</button><button className="button button--danger" type="button" onClick={confirmDeleteRelationship} data-cy="relationship-confirm-delete">Sim</button></div></div></div> : null}
    </div>
  )
}
