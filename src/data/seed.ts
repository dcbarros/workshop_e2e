import type { Client } from '../types'

export const CLIENT_INTERESTS = [
  'Vestuário',
  'Maquiagem',
  'Ferramentas',
  'Utensílios de cozinha',
  'Decoração',
  'Itens colecionáveis',
  'Papelaria',
  'Materiais de escritório',
  'Eletrônicos'
]

export const seedClients: Client[] = [
  {
    cpf: '52998224725',
    name: 'Ana Souza',
    birthDate: '14/07/1991',
    phone: '(19) 99888-1234',
    email: 'ana.souza@example.com',
    rg: '42.118.900-2',
    address: {
      cep: '13870-000',
      street: 'Rua Ademar de Barros',
      number: '315',
      complement: '',
      neighborhood: 'Centro',
      city: 'São João da Boa Vista',
      state: 'SP',
      country: 'Brasil'
    },
    clientTypes: ['Pessoa física'],
    interests: ['Papelaria', 'Eletrônicos'],
    preferredContact: 'WhatsApp',
    relationships: [
      { id: 'rel-ana-1', name: 'Carlos Lima', relation: 'Amigo', contact: '(19) 99777-5678' }
    ],
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z'
  },
  {
    cpf: '11144477735',
    name: 'Bruno Martins',
    birthDate: '03/02/1985',
    phone: 'ramal 204 / +55 19 3333-0020',
    email: 'bruno.martins@example.com',
    rg: 'MG-18.998.311',
    address: {
      cep: '01310-100',
      street: 'Avenida Paulista',
      number: '900',
      complement: '8º andar',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil'
    },
    clientTypes: ['Pessoa física', 'Pessoa jurídica'],
    interests: ['Ferramentas'],
    preferredContact: 'E-mail',
    relationships: [],
    createdAt: '2026-09-02T12:00:00.000Z',
    updatedAt: '2026-09-02T12:00:00.000Z'
  },
  {
    cpf: '39053344705',
    name: 'Carla Nogueira',
    birthDate: '23/11/1978',
    phone: 'contato preferencial por mensagem',
    email: 'carla@exemplo.com',
    rg: '55.400.119-X',
    address: {
      cep: '57020-000',
      street: 'Rua do Comércio',
      number: '122',
      complement: 'Sala 4',
      neighborhood: 'Centro',
      city: 'Maceió',
      state: 'AL',
      country: 'Brasil'
    },
    clientTypes: ['Pessoa jurídica'],
    interests: [],
    preferredContact: 'Telefone',
    relationships: [],
    createdAt: '2026-09-03T09:00:00.000Z',
    updatedAt: '2026-09-03T09:00:00.000Z'
  }
]
