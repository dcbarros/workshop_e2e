import type { Client } from '../types'
import { formatCpf } from './formatters'

function sanitize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[()\\]/g, (match) => `\\${match}`)
    .replace(/[^\x20-\x7E]/g, '')
}

function pdfLine(text: string, y: number, size = 11): string {
  return `BT /F1 ${size} Tf 50 ${y} Td (${sanitize(text)}) Tj ET\n`
}

export function downloadClientPdf(client: Client): void {
  const lines = [
    ['Cadastro de cliente', 790, 18],
    [`Nome: ${client.name}`, 752, 11],
    [`CPF: ${formatCpf(client.cpf)}`, 732, 11],
    [`Data de nascimento: ${client.birthDate || '-'}`, 712, 11],
    [`Telefone: ${client.phone || '-'}`, 692, 11],
    [`E-mail: ${client.email || '-'}`, 672, 11],
    [`RG: ${client.rg || '-'}`, 652, 11],
    [`Endereco: ${client.address.street}, ${client.address.number}`, 620, 11],
    [`Bairro: ${client.address.neighborhood}`, 600, 11],
    [`Cidade/UF: ${client.address.city} / ${client.address.state}`, 580, 11],
    [`CEP: ${client.address.cep}`, 560, 11],
    [`Pais: ${client.address.country}`, 540, 11],
    [`Tipo(s): ${client.clientTypes.join(', ')}`, 508, 11],
    [`Interesses: ${client.interests.join(', ') || 'Nenhum'}`, 488, 11],
    [`Contato preferencial: ${client.preferredContact || '-'}`, 468, 11],
    [`Relacionamentos: ${client.relationships.length}`, 448, 11]
  ] as const

  const content = lines.map(([text, y, size]) => pdfLine(text, y, size)).join('')
  const objects: string[] = []
  objects.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n')
  objects.push('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n')
  objects.push('3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >> endobj\n')
  objects.push(`4 0 obj << /Length ${content.length} >> stream\n${content}endstream endobj\n`)
  objects.push('5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n')

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((obj) => {
    offsets.push(pdf.length)
    pdf += obj
  })
  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  const blob = new Blob([pdf], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `cliente-${client.cpf}.pdf`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
