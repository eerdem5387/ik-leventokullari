import type { ZodError } from "zod"

const FIELD_LABELS: Record<string, string> = {
  fullName: "Ad soyad",
  residence: "Yaşadığınız yer",
  birthYear: "Doğum yılı",
  phone: "Telefon",
  universityDepartment: "Üniversite ve bölüm",
  formationStatus: "Formasyon durumu",
  appliedBranch: "Branş",
  experienceLevels: "Deneyim kademeleri",
  totalExperience: "Toplam deneyim",
  hasPrivateSchoolExperience: "Özel okul deneyimi",
  pedagogicalApproach: "Pedagojik yaklaşım",
  clubsAndActivities: "Kulüp / sosyal faaliyet",
  references: "Referanslar",
  kvkkAccepted: "KVKK onayı",
}

export function formatApplicationErrors(error: ZodError): string[] {
  return error.issues.map((issue) => {
    const key = String(issue.path[0] ?? "")
    const label = FIELD_LABELS[key] ?? key
    return `${label}: ${issue.message}`
  })
}
