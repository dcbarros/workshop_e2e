import { seedInteractions } from '../data/interactionSeed'
import type { Interaction, InteractionStatus } from '../types'
import { networkPulse, withLatency } from './fakeApi'

const INTERACTIONS_KEY = 'clientlab.interactions.v1'

function ensureSeed(): void {
  if (!localStorage.getItem(INTERACTIONS_KEY)) {
    localStorage.setItem(INTERACTIONS_KEY, JSON.stringify(seedInteractions))
  }
}

function read(): Interaction[] {
  ensureSeed()
  return JSON.parse(localStorage.getItem(INTERACTIONS_KEY) ?? '[]') as Interaction[]
}

function write(items: Interaction[]): void {
  localStorage.setItem(INTERACTIONS_KEY, JSON.stringify(items))
}

export async function listInteractions(): Promise<Interaction[]> {
  await networkPulse('interactions')
  return withLatency(() => read(), 450)
}

export async function createInteraction(input: Omit<Interaction, 'id' | 'protocol' | 'createdAt'>): Promise<Interaction> {
  await networkPulse('save-interaction')
  return withLatency(() => {
    const items = read()
    const nextNumber = items.reduce((max, item) => {
      const parsed = Number(item.protocol.split('-').at(-1))
      return Number.isFinite(parsed) ? Math.max(max, parsed) : max
    }, 0) + 1
    const item: Interaction = {
      ...input,
      id: `int-${Date.now()}`,
      protocol: `ATD-2026-${String(nextNumber).padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    }
    write([item, ...items])
    return item
  }, 550)
}

export async function updateInteractionStatus(id: string, status: InteractionStatus): Promise<void> {
  await networkPulse('update-interaction')
  return withLatency(() => {
    write(read().map((item) => item.id === id ? { ...item, status } : item))
  }, 300)
}

export async function deleteInteraction(id: string): Promise<void> {
  await networkPulse('delete-interaction')
  return withLatency(() => {
    write(read().filter((item) => item.id !== id))
  }, 300)
}

export function resetInteractions(): void {
  write(seedInteractions)
}
