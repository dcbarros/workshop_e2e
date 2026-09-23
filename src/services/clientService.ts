import { seedClients } from '../data/seed'
import type { CepResult, Client } from '../types'
import { networkPulse, withLatency } from './fakeApi'

const CLIENTS_KEY = 'clientlab.clients.v1'

function ensureSeed(): void {
  if (!localStorage.getItem(CLIENTS_KEY)) {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(seedClients))
  }
}

function readClients(): Client[] {
  ensureSeed()
  return JSON.parse(localStorage.getItem(CLIENTS_KEY) ?? '[]') as Client[]
}

function writeClients(clients: Client[]): void {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients))
}

export async function listClients(): Promise<Client[]> {
  await networkPulse('clients')
  return withLatency(() => readClients())
}

export async function getClient(cpf: string): Promise<Client | undefined> {
  await networkPulse('client-detail')
  return withLatency(() => readClients().find((client) => client.cpf === cpf), 250)
}

export async function saveClient(client: Client, originalCpf?: string): Promise<Client> {
  await networkPulse('save-client')
  return withLatency(() => {
    const clients = readClients()
    const duplicate = clients.some((item) => item.cpf === client.cpf && item.cpf !== originalCpf)
    if (duplicate) throw new Error('CPF já cadastrado.')

    const now = new Date().toISOString()
    const existing = originalCpf ? clients.find((item) => item.cpf === originalCpf) : undefined
    const saved: Client = {
      ...client,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    }

    const next = originalCpf
      ? clients.map((item) => (item.cpf === originalCpf ? saved : item))
      : [...clients, saved]

    writeClients(next)
    window.dispatchEvent(new CustomEvent('clientlab:clients-changed'))
    return saved
  }, 650)
}

export async function deleteClient(cpf: string): Promise<void> {
  await networkPulse('delete-client')
  return withLatency(() => {
    writeClients(readClients().filter((client) => client.cpf !== cpf))
    window.dispatchEvent(new CustomEvent('clientlab:clients-changed'))
  }, 450)
}

interface ViaCepResponse {
  erro?: boolean
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
}

/**
 * Consulta real ao ViaCEP. A aplicação continua frontend-only: o navegador fala
 * diretamente com a API pública e os cadastros continuam persistidos em localStorage.
 */
export async function lookupCep(cep: string): Promise<CepResult | null> {
  const normalized = cep.replace(/\D/g, '')
  if (!/^\d{8}$/.test(normalized)) return null

  const response = await fetch(`https://viacep.com.br/ws/${normalized}/json/`, {
    method: 'GET',
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error('Falha ao consultar o serviço de CEP.')
  }

  const data = await response.json() as ViaCepResponse
  if (data.erro) return null

  return {
    street: data.logradouro ?? '',
    neighborhood: data.bairro ?? '',
    city: data.localidade ?? '',
    state: data.uf ?? '',
    country: 'Brasil'
  }
}

export function resetWorkshopData(): void {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(seedClients))
  window.dispatchEvent(new CustomEvent('clientlab:clients-changed'))
}
