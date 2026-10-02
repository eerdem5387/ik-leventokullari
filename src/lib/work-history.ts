export type WorkHistoryInput = {
  institutionName: string
  phone: string
  directorName: string
}

function phoneDigits(value: string): number {
  return value.replace(/\D/g, "").length
}

/** Tamamen boş kurum kartlarını çıkarır */
export function sanitizeWorkHistory(entries: WorkHistoryInput[]): WorkHistoryInput[] {
  return entries.filter((e) =>
    [e.institutionName, e.phone, e.directorName].some((s) => s.trim().length > 0)
  )
}

/** Kısmen doldurulmuş kurum kartı varsa hata mesajı döner */
export function validateOptionalWorkHistory(entries: WorkHistoryInput[]): string | null {
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]
    const fields = [e.institutionName, e.phone, e.directorName].map((s) => s.trim())
    const filled = fields.filter(Boolean).length
    if (filled === 0) continue
    if (filled < 3) {
      return `Kurum ${i + 1}: Tüm alanları doldurun veya kurum kartını boş bırakın.`
    }
    if (e.institutionName.trim().length < 2) {
      return `Kurum ${i + 1}: Kurum adı en az 2 karakter olmalı.`
    }
    if (e.directorName.trim().length < 2) {
      return `Kurum ${i + 1}: Kurum müdürü adı en az 2 karakter olmalı.`
    }
    if (phoneDigits(e.phone) < 10) {
      return `Kurum ${i + 1}: Geçerli bir telefon numarası girin.`
    }
  }
  return null
}
