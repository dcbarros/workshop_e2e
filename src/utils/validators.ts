import { digitsOnly } from './formatters'

export function isValidCpf(value: string): boolean {
  const cpf = digitsOnly(value)
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false

  const checkDigit = (size: number) => {
    let sum = 0
    for (let index = 0; index < size; index += 1) {
      sum += Number(cpf[index]) * (size + 1 - index)
    }
    const result = (sum * 10) % 11
    return result === 10 ? 0 : result
  }

  return checkDigit(9) === Number(cpf[9]) && checkDigit(10) === Number(cpf[10])
}

export function isFullName(value: string): boolean {
  return value.trim().split(/\s+/).filter(Boolean).length >= 2
}

export function isValidEmail(value: string): boolean {
  if (!value.trim()) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function parseBirthDate(value: string): Date | null {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return null
  const [day, month, year] = value.split('/').map(Number)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return date
}

export function ageFromDate(date: Date): number {
  const today = new Date()
  let age = today.getFullYear() - date.getFullYear()
  const monthDelta = today.getMonth() - date.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < date.getDate())) age -= 1
  return age
}
