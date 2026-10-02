import { z } from "zod"
import {
  BRANCH_OPTIONS,
  CLUB_OPTIONS,
  EXPERIENCE_OPTIONS,
  FORMATION_OPTIONS,
  GRADE_LEVEL_OPTIONS,
  PRIVATE_SCHOOL_OPTIONS,
} from "./constants"
import {
  type WorkHistoryInput,
  sanitizeWorkHistory,
  validateOptionalWorkHistory,
} from "./work-history"

function phoneDigits(value: string): number {
  return value.replace(/\D/g, "").length
}

const phoneSchema = z
  .string()
  .trim()
  .refine((v) => phoneDigits(v) >= 10, "Geçerli bir telefon numarası girin (en az 10 rakam)")

const workHistoryEntrySchema = z.object({
  institutionName: z.string().trim(),
  phone: z.string().trim(),
  directorName: z.string().trim(),
})

export const applicationSchema = z.object({
  fullName: z.string().trim().min(3, "Ad soyad zorunludur"),
  residence: z.string().trim().min(2, "Yaşadığınız yer zorunludur"),
  birthYear: z
    .number({ error: "Doğum yılı zorunludur" })
    .int()
    .min(1950, "Geçerli bir doğum yılı girin")
    .max(new Date().getFullYear() - 18, "18 yaşından büyük olmalısınız"),
  phone: phoneSchema,
  universityDepartment: z.string().trim().min(3, "Üniversite ve bölüm zorunludur"),
  formationStatus: z.enum(FORMATION_OPTIONS, { error: "Formasyon durumu seçin" }),
  appliedBranch: z.enum(BRANCH_OPTIONS, { error: "Branş seçin" }),
  experienceLevels: z
    .array(z.enum(GRADE_LEVEL_OPTIONS))
    .min(1, "En az bir kademe seçin"),
  totalExperience: z.enum(EXPERIENCE_OPTIONS, { error: "Deneyim süresi seçin" }),
  hasPrivateSchoolExperience: z.enum(PRIVATE_SCHOOL_OPTIONS, {
    error: "Özel okul deneyimi seçin",
  }),
  clubsAndActivities: z
    .array(z.enum(CLUB_OPTIONS))
    .min(1, "En az bir kulüp veya sosyal faaliyet seçin"),
  workHistory: z.array(workHistoryEntrySchema),
  kvkkAccepted: z.literal(true, { error: "KVKK onayı zorunludur" }),
})

export type ApplicationFormData = z.infer<typeof applicationSchema>

/** Çalışma geçmişini temizler, kısmi doldurma hatasını döner */
export function prepareWorkHistory(raw: WorkHistoryInput[]): {
  workHistory: WorkHistoryInput[]
  error: string | null
} {
  const sanitized = sanitizeWorkHistory(raw)
  const error = validateOptionalWorkHistory(sanitized)
  return { workHistory: sanitized, error }
}
