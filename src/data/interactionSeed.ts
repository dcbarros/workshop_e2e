import type { Interaction } from '../types'

export const seedInteractions: Interaction[] = [
  {
    id: 'int-001',
    protocol: 'ATD-2026-001',
    clientCpf: '52998224725',
    clientName: 'Ana Souza',
    category: 'Suporte',
    subject: 'Dúvida sobre atualização cadastral',
    priority: 'Média',
    status: 'Aberto',
    options: ['Solicitar retorno'],
    createdAt: '2026-09-20T13:30:00.000Z'
  },
  {
    id: 'int-002',
    protocol: 'ATD-2026-002',
    clientCpf: '11144477735',
    clientName: 'Bruno Martins',
    category: 'Financeiro',
    subject: 'Revisão de documento de cobrança',
    priority: 'Alta',
    status: 'Em atendimento',
    options: ['Notificar responsável', 'Registrar e-mail'],
    attachment: { name: 'comprovante.pdf', type: 'application/pdf', size: 184320 },
    createdAt: '2026-09-21T15:10:00.000Z'
  },
  {
    id: 'int-003',
    protocol: 'ATD-2026-003',
    clientCpf: '39053344705',
    clientName: 'Carla Nogueira',
    category: 'Comercial',
    subject: 'Interesse em novos produtos',
    priority: 'Baixa',
    status: 'Resolvido',
    options: [],
    createdAt: '2026-09-22T09:00:00.000Z'
  },
  {
    id: 'int-004',
    protocol: 'ATD-2026-004',
    clientCpf: '52998224725',
    clientName: 'Ana Souza',
    category: 'Cadastro',
    subject: 'Confirmação de endereço',
    priority: 'Média',
    status: 'Em atendimento',
    options: ['Registrar e-mail'],
    createdAt: '2026-09-22T17:45:00.000Z'
  }
]
