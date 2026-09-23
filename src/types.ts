export type ClientType = 'Pessoa física' | 'Pessoa jurídica'
export type PreferredContact = 'Telefone' | 'E-mail' | 'WhatsApp'
export type ClientInterest = 'Vestuário' | 'Maquiagem' | 'Ferramentas' | 'Utensílios de cozinha' | 'Decoração' | 'Itens colecionáveis' | 'Papelaria' | 'Materiais de escritório' | 'Eletrônicos'

export interface Address {
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  country: string
}

export interface Relationship {
  id: string
  name: string
  relation: string
  contact: string
}

export interface Client {
  cpf: string
  name: string
  birthDate: string
  phone: string
  email: string
  rg: string
  photoDataUrl?: string
  address: Address
  clientTypes: ClientType[]
  interests: string[]
  preferredContact: PreferredContact
  relationships: Relationship[]
  createdAt: string
  updatedAt: string
}

export interface CepResult {
  street: string
  neighborhood: string
  city: string
  state: string
  country: string
}

export type InteractionCategory = 'Cadastro' | 'Comercial' | 'Financeiro' | 'Suporte'
export type InteractionPriority = 'Baixa' | 'Média' | 'Alta'
export type InteractionStatus = 'Aberto' | 'Em atendimento' | 'Resolvido'

export interface InteractionAttachment {
  name: string
  type: string
  size: number
}

export interface Interaction {
  id: string
  protocol: string
  clientCpf: string
  clientName: string
  category: InteractionCategory
  subject: string
  priority: InteractionPriority
  status: InteractionStatus
  options: string[]
  attachment?: InteractionAttachment
  createdAt: string
}
