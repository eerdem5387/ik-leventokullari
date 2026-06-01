import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { ALLOWED_CV_TYPES, MAX_CV_BYTES } from "@/lib/constants"
import { applicationSchema } from "@/lib/validation"

export const runtime = "nodejs"

function parseBirthYear(raw: FormDataEntryValue | null): number | null {
  if (raw == null || raw === "") return null
  const n = parseInt(String(raw), 10)
  return Number.isFinite(n) ? n : null
}

function parseReferences(raw: FormDataEntryValue | null) {
  if (!raw || typeof raw !== "string") return null
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function parseExperienceLevels(raw: FormDataEntryValue | null): string[] {
  if (!raw || typeof raw !== "string") return []
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const cvFile = formData.get("cv")

    if (!(cvFile instanceof File) || cvFile.size === 0) {
      return NextResponse.json({ error: "CV dosyası zorunludur" }, { status: 400 })
    }

    if (cvFile.size > MAX_CV_BYTES) {
      return NextResponse.json({ error: "CV dosyası en fazla 5 MB olabilir" }, { status: 400 })
    }

    if (!ALLOWED_CV_TYPES.includes(cvFile.type as (typeof ALLOWED_CV_TYPES)[number])) {
      return NextResponse.json(
        { error: "CV yalnızca PDF veya Word (.doc, .docx) formatında olabilir" },
        { status: 400 }
      )
    }

    const parsed = applicationSchema.safeParse({
      fullName: formData.get("fullName"),
      residence: formData.get("residence"),
      birthYear: parseBirthYear(formData.get("birthYear")),
      phone: formData.get("phone"),
      universityDepartment: formData.get("universityDepartment"),
      formationStatus: formData.get("formationStatus"),
      appliedBranch: formData.get("appliedBranch"),
      experienceLevels: parseExperienceLevels(formData.get("experienceLevels")),
      totalExperience: formData.get("totalExperience"),
      hasPrivateSchoolExperience: formData.get("hasPrivateSchoolExperience"),
      pedagogicalApproach: formData.get("pedagogicalApproach"),
      clubsAndActivities: formData.get("clubsAndActivities"),
      references: parseReferences(formData.get("references")),
      kvkkAccepted: formData.get("kvkkAccepted") === "true",
    })

    if (!parsed.success) {
      const first = parsed.error.issues[0]
      return NextResponse.json(
        { error: first?.message ?? "Form doğrulama hatası" },
        { status: 400 }
      )
    }

    const data = parsed.data
    const externalId = crypto.randomUUID()
    const createdAt = new Date().toISOString()

    const safeName = cvFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const blobPath = `ik-basvuru/${externalId}/${safeName}`

    const blob = await put(blobPath, cvFile, {
      access: "public",
      addRandomSuffix: false,
      contentType: cvFile.type,
    })

    const webhookUrl = process.env.YONETIM_WEBHOOK_URL
    const webhookSecret = process.env.HR_WEBHOOK_SECRET

    if (!webhookUrl || !webhookSecret) {
      console.error("[IK Basvuru] YONETIM_WEBHOOK_URL veya HR_WEBHOOK_SECRET eksik")
      return NextResponse.json(
        { error: "Sunucu yapılandırması eksik. Lütfen daha sonra tekrar deneyin." },
        { status: 500 }
      )
    }

    const payload = {
      id: externalId,
      ...data,
      hasPrivateSchoolExperience: data.hasPrivateSchoolExperience === "Evet",
      cvUrl: blob.url,
      cvFileName: cvFile.name,
      createdAt,
    }

    const webhookRes = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": webhookSecret,
        "X-Webhook-Source": "ik-leventokullari",
      },
      body: JSON.stringify(payload),
    })

    if (!webhookRes.ok) {
      const errBody = await webhookRes.json().catch(() => ({}))
      console.error("[IK Basvuru] Webhook hatası:", webhookRes.status, errBody)
      return NextResponse.json(
        { error: "Başvurunuz kaydedilemedi. Lütfen tekrar deneyin." },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true, id: externalId })
  } catch (error) {
    console.error("[IK Basvuru] Hata:", error)
    return NextResponse.json(
      { error: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    )
  }
}
