import { ALLOWED_CV_TYPES, MAX_CV_BYTES } from "./constants"

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"] as const

export function getCvExtension(fileName: string): string | null {
  const lower = fileName.toLowerCase().trim()
  for (const ext of ALLOWED_EXTENSIONS) {
    if (lower.endsWith(ext)) return ext
  }
  return null
}

export function isAllowedCvFile(file: File): boolean {
  if (file.size === 0 || file.size > MAX_CV_BYTES) return false
  if (ALLOWED_CV_TYPES.includes(file.type as (typeof ALLOWED_CV_TYPES)[number])) {
    return true
  }
  // Safari / Windows often send empty or generic MIME for .docx
  if (!file.type || file.type === "application/octet-stream") {
    return getCvExtension(file.name) !== null
  }
  return getCvExtension(file.name) !== null
}

export function cvFileErrorMessage(file: File | null): string | null {
  if (!file || file.size === 0) return "CV dosyası zorunludur"
  if (file.size > MAX_CV_BYTES) return "CV dosyası en fazla 5 MB olabilir"
  if (!isAllowedCvFile(file)) {
    return "CV yalnızca PDF veya Word (.doc, .docx) formatında olabilir"
  }
  return null
}
