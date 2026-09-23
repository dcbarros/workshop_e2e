export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

export function formatCpf(value: string): string {
  const digits = digitsOnly(value).slice(0, 11)
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

export function formatCep(value: string): string {
  const digits = digitsOnly(value).slice(0, 8)
  return digits.replace(/^(\d{5})(\d)/, '$1-$2')
}

export function shortDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(iso))
}
