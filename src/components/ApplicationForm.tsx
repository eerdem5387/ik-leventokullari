"use client"

import { useState } from "react"
import {
  BRANCH_OPTIONS,
  CLUB_OPTIONS,
  EXPERIENCE_OPTIONS,
  FORMATION_OPTIONS,
  GRADE_LEVEL_OPTIONS,
  PRIVATE_SCHOOL_OPTIONS,
} from "@/lib/constants"
import { cvFileErrorMessage } from "@/lib/cv-file"
import type { WorkHistoryInput } from "@/lib/work-history"
import { prepareWorkHistory } from "@/lib/validation"
import { SubmitResultScreen } from "./SubmitResultScreen"

const emptyWorkHistory = (): WorkHistoryInput => ({
  institutionName: "",
  phone: "",
  directorName: "",
})

type SubmitOverlay = null | { type: "loading" | "success" | "error"; message?: string }

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
  const [clubsAndActivities, setClubsAndActivities] = useState<string[]>([])
  const [workHistory, setWorkHistory] = useState<WorkHistoryInput[]>([emptyWorkHistory()])
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [kvkkAccepted, setKvkkAccepted] = useState(false)

  const [overlay, setOverlay] = useState<SubmitOverlay>(null)

  const toggleLevel = (level: string) => {
    setExperienceLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    )
  }

  const toggleClub = (club: string) => {
    setClubsAndActivities((prev) =>
      prev.includes(club) ? prev.filter((c) => c !== club) : [...prev, club]
    )
  }

  const updateWorkHistory = (
    index: number,
    field: keyof WorkHistoryInput,
    value: string
  ) => {
    setWorkHistory((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const removeWorkHistory = (index: number) => {
    setWorkHistory((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  const resetForm = () => {
    setFullName("")
    setResidence("")
    setBirthYear("")
    setPhone("")
    setUniversityDepartment("")
    setFormationStatus("")
    setAppliedBranch("")
    setExperienceLevels([])
    setTotalExperience("")
    setHasPrivateSchoolExperience("")
    setClubsAndActivities([])
    setWorkHistory([emptyWorkHistory()])
    setCvFile(null)
    setKvkkAccepted(false)
  }

  const handleOverlayClose = () => {
    const wasSuccess = overlay?.type === "success"
    setOverlay(null)
    if (wasSuccess) resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (experienceLevels.length === 0) {
      setOverlay({
        type: "error",
        message: "En az bir kademe (Ortaokul veya Lise) seçmelisiniz.",
      })
      return
    }

    if (clubsAndActivities.length === 0) {
      setOverlay({
        type: "error",
        message: "En az bir kulüp veya sosyal faaliyet seçmelisiniz.",
      })
      return
    }

    const cvErr = cvFileErrorMessage(cvFile)
    if (cvErr) {
      setOverlay({ type: "error", message: cvErr })
      return
    }

    if (!kvkkAccepted) {
      setOverlay({ type: "error", message: "KVKK onayını işaretlemelisiniz." })
      return
    }

    const { workHistory: cleanHistory, error: historyError } = prepareWorkHistory(workHistory)
    if (historyError) {
      setOverlay({ type: "error", message: historyError })
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
    formData.append("clubsAndActivities", JSON.stringify(clubsAndActivities))
    formData.append("workHistory", JSON.stringify(cleanHistory))
    formData.append("kvkkAccepted", kvkkAccepted ? "true" : "false")
    formData.append("cv", cvFile!)

    setOverlay({ type: "loading" })

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
            : data.error || "Başvurunuz kaydedilemedi. Lütfen tekrar deneyin."
        setOverlay({ type: "error", message: msg })
        return
      }

      setOverlay({
        type: "success",
        message:
          "Başvurunuz başarıyla alındı. İnsan Kaynakları ekibimiz başvurunuzu inceleyecek; uygun görülmesi halinde sizinle iletişime geçilecektir.",
      })
    } catch {
      setOverlay({
        type: "error",
        message: "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edip tekrar deneyin.",
      })
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20"

  return (
    <>
      {overlay && (
        <SubmitResultScreen
          type={overlay.type}
          message={overlay.message}
          onClose={handleOverlayClose}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
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
          <SectionTitle>Kulüp ve Sosyal Faaliyetler</SectionTitle>
          <Field label="Yürütebileceğiniz kulüp veya sosyal faaliyetler *">
            <div className="mt-2 flex flex-wrap gap-3">
              {CLUB_OPTIONS.map((club) => (
                <label
                  key={club}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 has-[:checked]:border-[#1e3a5f] has-[:checked]:bg-[#1e3a5f]/5"
                >
                  <input
                    type="checkbox"
                    checked={clubsAndActivities.includes(club)}
                    onChange={() => toggleClub(club)}
                  />
                  <span className="text-sm font-medium text-slate-800">{club}</span>
                </label>
              ))}
            </div>
          </Field>
        </section>

        <section className="space-y-5">
          <SectionTitle>Çalışma Geçmişi</SectionTitle>
          <p className="text-sm text-slate-600">
            Daha önce çalıştığınız kurumları ekleyebilirsiniz. Yeni mezunsanız boş
            bırakabilirsiniz. Bir kurum kartına başladıysanız tüm alanları eksiksiz doldurun.
          </p>
          <div className="space-y-6">
            {workHistory.map((entry, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 space-y-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#1e3a5f]">Kurum {index + 1}</p>
                  {workHistory.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWorkHistory(index)}
                      className="text-sm font-medium text-slate-500 hover:text-red-600"
                    >
                      Kaldır
                    </button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Kurum adı">
                    <input
                      className={inputClass}
                      value={entry.institutionName}
                      onChange={(e) =>
                        updateWorkHistory(index, "institutionName", e.target.value)
                      }
                      placeholder="Örn: Levent Okulları"
                    />
                  </Field>
                  <Field label="Telefon numarası">
                    <input
                      type="tel"
                      className={inputClass}
                      value={entry.phone}
                      onChange={(e) => updateWorkHistory(index, "phone", e.target.value)}
                    />
                  </Field>
                  <Field label="Kurum müdürü">
                    <input
                      className={inputClass}
                      value={entry.directorName}
                      onChange={(e) =>
                        updateWorkHistory(index, "directorName", e.target.value)
                      }
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setWorkHistory((prev) => [...prev, emptyWorkHistory()])}
            className="text-sm font-medium text-[#1e3a5f] hover:underline"
          >
            + Kurum Ekle
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
          disabled={
            overlay?.type === "loading" ||
            experienceLevels.length === 0 ||
            clubsAndActivities.length === 0
          }
          className="w-full rounded-xl bg-[#1e3a5f] px-6 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-[#152a45] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[240px]"
        >
          {overlay?.type === "loading" ? "Gönderiliyor..." : "Başvuruyu Gönder"}
        </button>
      </form>
    </>
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
