export type ReferenceInput = {
  firstName: string
  lastName: string
  title: string
  phone: string
}

function phoneDigits(value: string): number {
  return value.replace(/\D/g, "").length
}

/** Tamamen boş referans kartlarını çıkarır */
export function sanitizeReferences(refs: ReferenceInput[]): ReferenceInput[] {
  return refs.filter((r) =>
    [r.firstName, r.lastName, r.title, r.phone].some((s) => s.trim().length > 0)
  )
}

/** Kısmen doldurulmuş referans varsa hata mesajı döner */
export function validateOptionalReferences(refs: ReferenceInput[]): string | null {
  for (let i = 0; i < refs.length; i++) {
    const r = refs[i]
    const fields = [r.firstName, r.lastName, r.title, r.phone].map((s) => s.trim())
    const filled = fields.filter(Boolean).length
    if (filled === 0) continue
    if (filled < 4) {
      return `Referans ${i + 1}: Tüm alanları doldurun veya referansı boş bırakın.`
    }
    if (r.firstName.trim().length < 2 || r.lastName.trim().length < 2) {
      return `Referans ${i + 1}: Ad ve soyad en az 2 karakter olmalı.`
    }
    if (r.title.trim().length < 2) {
      return `Referans ${i + 1}: Unvan zorunludur.`
    }
    if (phoneDigits(r.phone) < 10) {
      return `Referans ${i + 1}: Geçerli bir telefon numarası girin.`
    }
  }
  return null
}
