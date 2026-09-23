import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { listClients } from "../services/clientService";
import {
  createInteraction,
  deleteInteraction,
  listInteractions,
  resetInteractions,
  updateInteractionStatus,
} from "../services/interactionService";
import type {
  Client,
  Interaction,
  InteractionCategory,
  InteractionPriority,
  InteractionStatus,
} from "../types";

const categories: InteractionCategory[] = [
  "Cadastro",
  "Comercial",
  "Financeiro",
  "Suporte",
];
const priorities: InteractionPriority[] = ["Baixa", "Média", "Alta"];
const statuses: InteractionStatus[] = ["Aberto", "Em atendimento", "Resolvido"];
const followUpOptions = [
  "Registrar e-mail",
  "Solicitar retorno",
  "Notificar responsável",
];

function readableSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function Interactions() {
  const [clients, setClients] = useState<Client[]>([]);
  const [items, setItems] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [clientCpf, setClientCpf] = useState("");
  const [category, setCategory] = useState<InteractionCategory>("Cadastro");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<InteractionPriority>("Média");
  const [options, setOptions] = useState<string[]>([]);
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Todos" | InteractionStatus>(
    "Todos",
  );
  const [categoryFilter, setCategoryFilter] = useState<
    "Todas" | InteractionCategory
  >("Todas");
  const [onlyWithAttachment, setOnlyWithAttachment] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] =
    useState<InteractionStatus>("Em atendimento");

  async function load() {
    setLoading(true);
    try {
      const [loadedClients, loadedItems] = await Promise.all([
        listClients(),
        listInteractions(),
      ]);
      setClients(loadedClients);
      setItems(loadedItems);
      if (!clientCpf && loadedClients.length > 0)
        setClientCpf(loadedClients[0].cpf);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.toLocaleLowerCase("pt-BR");
    return items.filter((item) => {
      const matchesText =
        !normalizedQuery ||
        [item.protocol, item.clientName, item.subject].some((value) =>
          value.toLocaleLowerCase("pt-BR").includes(normalizedQuery),
        );
      const matchesStatus =
        statusFilter === "Todos" || item.status === statusFilter;
      const matchesCategory =
        categoryFilter === "Todas" || item.category === categoryFilter;
      const matchesAttachment = !onlyWithAttachment || Boolean(item.attachment);
      return (
        matchesText && matchesStatus && matchesCategory && matchesAttachment
      );
    });
  }, [items, query, statusFilter, categoryFilter, onlyWithAttachment]);

  function toggleOption(option: string) {
    setOptions((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );
  }

  function resetForm() {
    setClientCpf(clients[0]?.cpf ?? "");
    setCategory("Cadastro");
    setSubject("");
    setPriority("Média");
    setOptions([]);
    setAttachment(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!clientCpf || !subject.trim()) {
      setNotice("Selecione um cliente e informe o assunto antes de adicionar.");
      return;
    }

    const selectedClient = clients.find((client) => client.cpf === clientCpf);
    if (!selectedClient) return;

    setSaving(true);
    try {
      await createInteraction({
        clientCpf,
        clientName: selectedClient.name,
        category,
        subject: subject.trim(),
        priority,
        status: "Aberto",
        options,
        attachment: attachment
          ? {
              name: attachment.name,
              type: attachment.type,
              size: attachment.size,
            }
          : undefined,
      });
      resetForm();
      setNotice("Interação adicionada à fila.");
      await load();
    } finally {
      setSaving(false);
      window.setTimeout(() => setNotice(""), 1800);
    }
  }

  async function changeStatus(id: string, status: InteractionStatus) {
    await updateInteractionStatus(id, status);
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  }

  async function remove(id: string) {
    await deleteInteraction(id);
    setItems((current) => current.filter((item) => item.id !== id));
    setSelectedIds((current) => current.filter((selected) => selected !== id));
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function toggleAllVisible() {
    const visibleIds = filtered.map((item) => item.id);
    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds((current) =>
      allSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds])),
    );
  }

  async function applyBulkStatus() {
    const ids = selectedIds.filter((id) =>
      items.some((item) => item.id === id),
    );
    if (ids.length === 0) {
      setNotice("Selecione ao menos uma linha da tabela.");
      return;
    }
    await Promise.all(ids.map((id) => updateInteractionStatus(id, bulkStatus)));
    setItems((current) =>
      current.map((item) =>
        ids.includes(item.id) ? { ...item, status: bulkStatus } : item,
      ),
    );
    setNotice(`${ids.length} registro(s) atualizado(s).`);
    window.setTimeout(() => setNotice(""), 1600);
  }

  function restore() {
    resetInteractions();
    setSelectedIds([]);
    setNotice("Dados da área demonstrativa restaurados.");
    void load();
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Área demonstrativa</span>
          <h1>Atendimentos</h1>
          <p>
            Uma área coerente com o ClientLab para demonstrar componentes antes
            dos exercícios nas telas de clientes.
          </p>
        </div>
        <button
          className="button button--secondary"
          type="button"
          onClick={restore}
          data-cy="lab-reset"
        >
          Restaurar exemplos
        </button>
      </header>

      {notice ? (
        <div className="toast" role="status">
          {notice}
        </div>
      ) : null}

      <section className="panel form-section">
        <div className="section-heading">
          <div>
            <span className="section-index">01</span>
            <h2>Nova interação</h2>
            <p>
              Combobox, input, radio button, checkbox e upload no mesmo fluxo.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="lab-form" data-cy="lab-form">
          <label className="field">
            <span className="field__label">Cliente</span>
            <select
              className="field__control select-control"
              value={clientCpf}
              onChange={(e) => setClientCpf(e.target.value)}
              data-cy="lab-client-select"
            >
              {clients.map((client) => (
                <option key={client.cpf} value={client.cpf}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Categoria</span>
            <select
              className="field__control select-control"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as InteractionCategory)
              }
              data-cy="lab-category-select"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="field span-2">
            <span className="field__label">Assunto</span>
            <input
              className="field__control"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={60}
              placeholder="Descreva resumidamente o atendimento"
              data-cy="lab-subject"
            />
            <span className="field__hint">Máximo de 60 caracteres.</span>
          </label>

          <fieldset
            className="choice-group span-2"
            data-cy="lab-priority-group"
          >
            <legend>Prioridade</legend>
            <div className="radio-row">
              {priorities.map((item) => (
                <label className="radio-card" key={item}>
                  <input
                    type="radio"
                    name="lab-priority"
                    value={item}
                    checked={priority === item}
                    onChange={() => setPriority(item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="choice-group span-2" data-cy="lab-options-group">
            <legend>Ações complementares</legend>
            <div className="lab-check-grid">
              {followUpOptions.map((option) => (
                <label className="check-pill" key={option}>
                  <input
                    type="checkbox"
                    checked={options.includes(option)}
                    onChange={() => toggleOption(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="file-card span-2">
            <div className="file-card__info">
              <span>
                <strong>Anexo do atendimento</strong>
                <small>
                  PDF, imagem ou arquivo de texto. Nesta área o conteúdo não é
                  persistido, apenas os metadados do arquivo.
                </small>
              </span>

              {attachment ? (
                <em data-cy="lab-file-name">
                  {attachment.name} · {readableSize(attachment.size)}
                </em>
              ) : (
                <em>Nenhum arquivo selecionado.</em>
              )}
            </div>

            <div className="file-card__actions">
              <input
                ref={fileInput}
                type="file"
                className="visually-hidden"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setAttachment(e.target.files?.[0] ?? null)
                }
                data-cy="lab-file"
              />

              <button
                type="button"
                className="button button--secondary"
                onClick={() => fileInput.current?.click()}
                data-cy="lab-file-button"
              >
                📎 Selecionar arquivo
              </button>
            </div>
          </div>

          <div className="lab-form-actions span-2">
            <button
              className="button button--ghost"
              type="button"
              onClick={resetForm}
              data-cy="lab-clear"
            >
              Limpar
            </button>
            <button
              className="button button--primary"
              type="submit"
              disabled={saving || loading}
              data-cy="lab-add"
            >
              {saving ? "Adicionando…" : "Adicionar à fila"}
            </button>
          </div>
        </form>
      </section>

      <section className="panel table-panel">
        <div className="section-heading lab-table-heading">
          <div>
            <span className="section-index">02</span>
            <h2>Fila de atendimentos</h2>
            <p>
              Filtros, linhas, células, seleção múltipla e atualização de
              status.
            </p>
          </div>
        </div>
        <div className="lab-filters">
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar protocolo, cliente ou assunto"
              data-cy="lab-search"
            />
          </label>
          <label className="mini-field">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "Todos" | InteractionStatus)
              }
              data-cy="lab-status-filter"
            >
              <option>Todos</option>
              {statuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="mini-field">
            <span>Categoria</span>
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value as "Todas" | InteractionCategory,
                )
              }
              data-cy="lab-category-filter"
            >
              <option>Todas</option>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="table-check">
            <input
              type="checkbox"
              checked={onlyWithAttachment}
              onChange={(e) => setOnlyWithAttachment(e.target.checked)}
              data-cy="lab-only-attachment"
            />
            <span>Somente com anexo</span>
          </label>
        </div>

        <div className="bulk-bar">
          <span>{selectedIds.length} selecionado(s)</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value as InteractionStatus)}
            data-cy="lab-bulk-status"
          >
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => void applyBulkStatus()}
            data-cy="lab-bulk-apply"
          >
            Aplicar status
          </button>
          <span className="result-count">{filtered.length} resultado(s)</span>
        </div>

        <div className="table-scroll">
          <table data-cy="lab-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label="Selecionar linhas visíveis"
                    checked={
                      filtered.length > 0 &&
                      filtered.every((item) => selectedIds.includes(item.id))
                    }
                    onChange={toggleAllVisible}
                    data-cy="lab-select-all"
                  />
                </th>
                <th>Protocolo</th>
                <th>Cliente</th>
                <th>Categoria</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Anexo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="empty-state">
                    Carregando atendimentos…
                  </td>
                </tr>
              ) : null}
              {!loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-state">
                    Nenhum atendimento encontrado.
                  </td>
                </tr>
              ) : null}
              {!loading &&
                filtered.map((item) => (
                  <tr key={item.id} data-cy="lab-row">
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Selecionar ${item.protocol}`}
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelected(item.id)}
                        data-cy="lab-row-select"
                      />
                    </td>
                    <td>
                      <strong>{item.protocol}</strong>
                      <small>
                        {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                      </small>
                    </td>
                    <td>
                      <strong>{item.clientName}</strong>
                      <small>{item.subject}</small>
                    </td>
                    <td>
                      <span className="tag">{item.category}</span>
                    </td>
                    <td>{item.priority}</td>
                    <td>
                      <select
                        className="table-select"
                        value={item.status}
                        onChange={(e) =>
                          void changeStatus(
                            item.id,
                            e.target.value as InteractionStatus,
                          )
                        }
                        aria-label={`Status ${item.protocol}`}
                        data-cy="lab-row-status"
                      >
                        {statuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {item.attachment ? (
                        <span
                          title={`${item.attachment.type} · ${readableSize(item.attachment.size)}`}
                        >
                          {item.attachment.name}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="icon-button icon-button--danger"
                        type="button"
                        title="Excluir atendimento"
                        onClick={() => void remove(item.id)}
                        data-cy="lab-delete"
                      >
                        ⌫
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
