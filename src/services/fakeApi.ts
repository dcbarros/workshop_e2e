let requestSequence = 0

/**
 * Produces a real browser request to a static JSON endpoint before the operation
 * is fulfilled from localStorage. This keeps the project frontend-only while
 * giving Cypress something observable with cy.intercept().
 */
export async function networkPulse(endpoint: string): Promise<void> {
  requestSequence += 1
  const response = await fetch(`./mock-api/${endpoint}.json?request=${requestSequence}`, {
    method: 'GET',
    cache: 'no-store',
    headers: { 'X-Workshop-Client': 'ClientLab' }
  })

  if (!response.ok) {
    throw new Error(`Falha na simulação de rede: ${endpoint}`)
  }

  await response.json()
}

export async function withLatency<T>(work: () => T | Promise<T>, delay = 350): Promise<T> {
  await new Promise((resolve) => window.setTimeout(resolve, delay))
  return work()
}
