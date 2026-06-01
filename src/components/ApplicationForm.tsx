"use client"

import { useState } from "react"
import {
  BRANCH_OPTIONS,
  EXPERIENCE_OPTIONS,
  FORMATION_OPTIONS,
  GRADE_LEVEL_OPTIONS,
  PRIVATE_SCHOOL_OPTIONS,
} from "@/lib/constants"
import { cvFileErrorMessage } from "@/lib/cv-file"
import type { ReferenceInput } from "@/lib/validation"

const emptyReference = (): ReferenceInput => ({
  firstName: "",
  lastName: "",
  title: "",
  phone: "",
})

export function ApplicationForm() {
  const [fullName, setFullName] = useState("")
  const [residence, setResidence] = useState("")
  const [birthYear, setBirthYear] = useState("")
  const [phone, setPhone] = useState("")
  const [universityDepartment, setUniversityDepartment] = useState("")
  const [formationStatus, setFormationStatus] = useState("")
  const [appliedBranch, setAppliedBranch] = useState("")
  const [experienceLevels, setExperienceLevels] = useState<string[]>([])
  const [totalExperience, setTotalExperience] = useState("")
  const [hasPrivateSchoolExperience, setHasPrivateSchoolExperience] = useState("")
  const [pedagogicalApproach, setPedagogicalApproach] = useState("")
  const [clubsAndActivities, setClubsAndActivities] = useState("")
  const [references, setReferences] = useState<ReferenceInput[]>([
    emptyReference(),
    emptyReference(),
  ])
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [kvkkAccepted, setKvkkAccepted] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const toggleLevel = (level: string) => {
    setExperienceLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    )
  }

  const updateReference = (index: number, field: keyof ReferenceInput, value: string) => {
    setReferences((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (experienceLevels.length === 0) {
      setError("En az bir kademe (Ortaokul veya Lise) seçmelisiniz")
      return
    }

    const cvErr = cvFileErrorMessage(cvFile)
    if (cvErr) {
      setError(cvErr)
      return
    }

    if (!kvkkAccepted) {
      setError("KVKK onayını işaretlemelisiniz")
      return
    }

    const formData = new FormData()
    formData.append("fullName", fullName)
    formData.append("residence", residence)
    formData.append("birthYear", birthYear)
    formData.append("phone", phone)
    formData.append("universityDepartment", universityDepartment)
    formData.append("formationStatus", formationStatus)
    formData.append("appliedBranch", appliedBranch)
    formData.append("experienceLevels", JSON.stringify(experienceLevels))
    formData.append("totalExperience", totalExperience)
    formData.append("hasPrivateSchoolExperience", hasPrivateSchoolExperience)
    formData.append("pedagogicalApproach", pedagogicalApproach)
    formData.append("clubsAndActivities", clubsAndActivities)
    formData.append("references", JSON.stringify(references))
    formData.append("kvkkAccepted", kvkkAccepted ? "true" : "false")
    formData.append("cv", cvFile!)

    setSubmitting(true)
    try {
      const res = await fetch("/api/basvuru", { method: "POST", body: formData })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        errors?: string[]
      }
      if (!res.ok) {
        const msg =
          Array.isArray(data.errors) && data.errors.length > 0
            ? data.errors.join(" • ")
            : data.error || "Başvuru gönderilemedi"
        throw new Error(msg)
      }
      setSuccess(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
          ✓
        </div>
        <h2 className="text-2xl font-semibold text-emerald-900">Başvurunuz alındı</h2>
        <p className="mt-3 text-emerald-800/90">
          İnsan Kaynakları ekibimiz başvurunuzu inceleyecektir. Uygun görülmesi halinde sizinle
          iletişime geçilecektir.
        </p>
      </div>
    )
  }

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20"

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {error && (
        <div
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          <p className="font-semibold">Başvuru gönderilemedi</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      <section className="space-y-5">
        <SectionTitle>Kişisel Bilgiler</SectionTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Ad / Soyad *">
            <input
              required
              className={inputClass}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Adınız ve soyadınız"
            />
          </Field>
          <Field label="Yaşadığınız yer *">
            <input
              required
              className={inputClass}
              value={residence}
              onChange={(e) => setResidence(e.target.value)}
              placeholder="İl / ilçe"
            />
          </Field>
          <Field label="Doğum yılı *">
            <input
              required
              type="number"
              min={1950}
              max={new Date().getFullYear() - 18}
              className={inputClass}
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder="Örn: 1995"
            />
          </Field>
          <Field label="İletişim numarası *">
            <input
              required
              type="tel"
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05XX XXX XX XX"
            />
          </Field>
        </div>
      </section>

      <section className="space-y-5">
        <SectionTitle>Eğitim Bilgileri</SectionTitle>
        <Field label="Mezun olunan üniversite ve bölüm *">
          <input
            required
            className={inputClass}
            value={universityDepartment}
            onChange={(e) => setUniversityDepartment(e.target.value)}
            placeholder="Örn: İstanbul Üniversitesi — Matematik Öğretmenliği"
          />
        </Field>
        <Field label="Formasyon durumu *">
          <div className="mt-2 space-y-2">
            {FORMATION_OPTIONS.map((opt) => (
              <label
                key={opt}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 has-[:checked]:border-[#1e3a5f] has-[:checked]:bg-[#1e3a5f]/5"
              >
                <input
                  type="radio"
                  name="formationStatus"
                  required
                  value={opt}
                  checked={formationStatus === opt}
                  onChange={() => setFormationStatus(opt)}
                  className="mt-1"
                />
                <span className="text-sm text-slate-800">{opt}</span>
              </label>
            ))}
          </div>
        </Field>
      </section>

      <section className="space-y-5">
        <SectionTitle>Branş ve Deneyim Detayları</SectionTitle>
        <p className="text-sm text-slate-600">
          Deneyimli olduğunuz kademeler, okulumuzdaki açık kadrolarla eşleştirme için
          değerlendirilir.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Başvurulan branş *">
            <select
              required
              className={inputClass}
              value={appliedBranch}
              onChange={(e) => setAppliedBranch(e.target.value)}
            >
              <option value="">Seçiniz</option>
              {BRANCH_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Toplam öğretmenlik deneyimi *">
            <select
              required
              className={inputClass}
              value={totalExperience}
              onChange={(e) => setTotalExperience(e.target.value)}
            >
              <option value="">Seçiniz</option>
              {EXPERIENCE_OPTIONS.map((exp) => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Deneyimli olduğu kademeler *">
          <div className="mt-2 flex flex-wrap gap-3">
            {GRADE_LEVEL_OPTIONS.map((level) => (
              <label
                key={level}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 has-[:checked]:border-[#1e3a5f] has-[:checked]:bg-[#1e3a5f]/5"
              >
                <input
                  type="checkbox"
                  checked={experienceLevels.includes(level)}
                  onChange={() => toggleLevel(level)}
                />
                <span className="text-sm font-medium text-slate-800">{level}</span>
              </label>
            ))}
          </div>
          {experienceLevels.length === 0 && (
            <p className="mt-1 text-xs text-amber-700">En az bir kademe seçmelisiniz.</p>
          )}
        </Field>
        <Field label="Özel okul deneyimi var mı? *">
          <div className="mt-2 flex gap-4">
            {PRIVATE_SCHOOL_OPTIONS.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="privateSchool"
                  required
                  value={opt}
                  checked={hasPrivateSchoolExperience === opt}
                  onChange={() => setHasPrivateSchoolExperience(opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </Field>
      </section>

      <section className="space-y-5">
        <SectionTitle>Pedagojik Yaklaşım ve Eğitim Teknolojileri</SectionTitle>
        <p className="text-sm text-slate-600">
          Modern bir özel okulda teknolojiye ve yeni nesil eğitim metodolojilerine yönelik
          yaklaşımınızı kısaca paylaşın.
        </p>
        <Field label="Pedagojik yaklaşım ve eğitim teknolojileri *">
          <textarea
            required
            rows={4}
            className={inputClass}
            value={pedagogicalApproach}
            onChange={(e) => setPedagogicalApproach(e.target.value)}
            placeholder="Sınıf yönetimi, dijital araçlar, ölçme-değerlendirme vb."
          />
        </Field>
        <Field label="Yürütebileceğiniz kulüp veya sosyal faaliyetler *">
          <textarea
            required
            rows={3}
            className={inputClass}
            value={clubsAndActivities}
            onChange={(e) => setClubsAndActivities(e.target.value)}
            placeholder="Örn: Robotik Kodlama, Satranç, Tiyatro, Yaratıcı Yazarlık, Münazara..."
          />
        </Field>
      </section>

      <section className="space-y-5">
        <SectionTitle>Referanslar</SectionTitle>
        <p className="text-sm text-slate-600">
          En az 2 referans (okul müdürü, zümre başkanı veya üniversite hocası): ad, soyad, unvan ve
          iletişim numarası.
        </p>
        <div className="space-y-6">
          {references.map((ref, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 space-y-4"
            >
              <p className="text-sm font-semibold text-[#1e3a5f]">Referans {index + 1}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ad *">
                  <input
                    required
                    className={inputClass}
                    value={ref.firstName}
                    onChange={(e) => updateReference(index, "firstName", e.target.value)}
                  />
                </Field>
                <Field label="Soyad *">
                  <input
                    required
                    className={inputClass}
                    value={ref.lastName}
                    onChange={(e) => updateReference(index, "lastName", e.target.value)}
                  />
                </Field>
                <Field label="Unvan *">
                  <input
                    required
                    className={inputClass}
                    value={ref.title}
                    onChange={(e) => updateReference(index, "title", e.target.value)}
                    placeholder="Örn: Okul Müdürü"
                  />
                </Field>
                <Field label="İletişim numarası *">
                  <input
                    required
                    type="tel"
                    className={inputClass}
                    value={ref.phone}
                    onChange={(e) => updateReference(index, "phone", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setReferences((prev) => [...prev, emptyReference()])}
          className="text-sm font-medium text-[#1e3a5f] hover:underline"
        >
          + Bir referans daha ekle
        </button>
      </section>

      <section className="space-y-4">
        <SectionTitle>Özgeçmiş (CV)</SectionTitle>
        <Field label="CV yükle * (PDF veya Word, en fazla 5 MB)">
          <input
            required
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="mt-1.5 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#1e3a5f] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#152a45]"
            onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
          />
          {cvFile && (
            <p className="mt-2 text-xs text-slate-500">
              Seçilen: {cvFile.name} ({(cvFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </Field>
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            required
            checked={kvkkAccepted}
            onChange={(e) => setKvkkAccepted(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-slate-700">
            Kişisel verilerimin İnsan Kaynakları süreçleri kapsamında işlenmesine ve başvurumun
            değerlendirilmesine ilişkin aydınlatma metnini okudum, kabul ediyorum. *
          </span>
        </label>
      </section>

      <button
        type="submit"
        disabled={submitting || experienceLevels.length === 0}
        className="w-full rounded-xl bg-[#1e3a5f] px-6 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-[#152a45] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[240px]"
      >
        {submitting ? "Gönderiliyor..." : "Başvuruyu Gönder"}
      </button>
    </form>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-[#1e3a5f]">
      {children}
    </h2>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </div>
  )
}
