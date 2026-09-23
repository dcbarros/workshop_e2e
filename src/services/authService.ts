import { networkPulse, withLatency } from './fakeApi'

const AUTH_KEY = 'clientlab.authenticated'

export async function login(username: string, password: string): Promise<boolean> {
  await networkPulse('login')
  return withLatency(() => {
    const valid = username === 'qa.workshop' && password === 'cypress123'
    if (valid) sessionStorage.setItem(AUTH_KEY, 'true')
    return valid
  }, 450)
}

export function logout(): void {
  sessionStorage.removeItem(AUTH_KEY)
}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === 'true'
}
