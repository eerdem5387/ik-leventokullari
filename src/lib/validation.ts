import { z } from "zod"
import {
  BRANCH_OPTIONS,
  EXPERIENCE_OPTIONS,
  FORMATION_OPTIONS,
  GRADE_LEVEL_OPTIONS,
  PRIVATE_SCHOOL_OPTIONS,
} from "./constants"
import {
  type ReferenceInput,
  sanitizeReferences,
  validateOptionalReferences,
} from "./references"

function phoneDigits(value: string): number {
  return value.replace(/\D/g, "").length
}

const phoneSchema = z
  .string()
  .trim()
  .refine((v) => phoneDigits(v) >= 10, "Geçerli bir telefon numarası girin (en az 10 rakam)")

const referenceEntrySchema = z.object({
  firstName: z.string().trim(),
  lastName: z.string().trim(),
  title: z.string().trim(),
  phone: z.string().trim(),
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
  pedagogicalApproach: z
    .string()
    .trim()
    .min(10, "Pedagojik yaklaşım alanı en az 10 karakter olmalı"),
  clubsAndActivities: z
    .string()
    .trim()
    .min(5, "Kulüp / sosyal faaliyet alanı zorunludur"),
  references: z.array(referenceEntrySchema),
  kvkkAccepted: z.literal(true, { error: "KVKK onayı zorunludur" }),
})

export type ApplicationFormData = z.infer<typeof applicationSchema>

/** Referansları temizler, kısmi doldurma hatasını döner */
export function prepareReferences(raw: ReferenceInput[]): {
  references: ReferenceInput[]
  error: string | null
} {
  const sanitized = sanitizeReferences(raw)
  const error = validateOptionalReferences(sanitized)
  return { references: sanitized, error }
}
