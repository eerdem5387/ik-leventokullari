export const FORMATION_OPTIONS = [
  "Pedagojik Formasyonum var",
  "Eğitim Fakültesi Mezunuyum",
  "Formasyonum yok",
] as const

export const BRANCH_OPTIONS = [
  "Matematik",
  "İngilizce",
  "Rehberlik",
  "Fen Bilimleri",
  "Türkçe",
  "Sosyal Bilgiler",
  "Beden Eğitimi",
  "Müzik",
  "Görsel Sanatlar",
  "Bilişim Teknolojileri",
  "Almanca",
  "Fransızca",
  "Din Kültürü ve Ahlak Bilgisi",
  "Diğer",
] as const

export const GRADE_LEVEL_OPTIONS = ["Ortaokul", "Lise"] as const

export const EXPERIENCE_OPTIONS = [
  "Yeni mezun",
  "1-3 yıl",
  "4-7 yıl",
  "8+ yıl",
] as const

export const PRIVATE_SCHOOL_OPTIONS = ["Evet", "Hayır"] as const

export const MAX_CV_BYTES = 5 * 1024 * 1024 // 5 MB
export const ALLOWED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const
