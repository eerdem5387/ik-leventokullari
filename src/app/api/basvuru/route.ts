import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { parseReferences } from "@/lib/parse-form-refs"
import { formatApplicationErrors } from "@/lib/format-validation-errors"
import { applicationSchema, prepareReferences } from "@/lib/validation"
import { cvFileErrorMessage, getCvExtension } from "@/lib/cv-file"

export const runtime = "nodejs"

function parseBirthYear(raw: FormDataEntryValue | null): number | null {
  if (raw == null || raw === "") return null
  const n = parseInt(String(raw), 10)
  return Number.isFinite(n) ? n : null
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

    if (!(cvFile instanceof File)) {
      return NextResponse.json({ error: "CV dosyası zorunludur" }, { status: 400 })
    }

    const cvError = cvFileErrorMessage(cvFile)
    if (cvError) {
      return NextResponse.json({ error: cvError }, { status: 400 })
    }

    const rawRefs = parseReferences(formData.get("references"))
    const { references, error: refError } = prepareReferences(rawRefs)
    if (refError) {
      return NextResponse.json({ error: refError }, { status: 400 })
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
      references,
      kvkkAccepted: formData.get("kvkkAccepted") === "true",
    })

    if (!parsed.success) {
      const errors = formatApplicationErrors(parsed.error)
      return NextResponse.json(
        {
          error: errors[0] ?? "Form doğrulama hatası",
          errors,
        },
        { status: 400 }
      )
    }

    const data = parsed.data
    const externalId = crypto.randomUUID()
    const createdAt = new Date().toISOString()

    const safeName = cvFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const blobPath = `ik-basvuru/${externalId}/${safeName}`

    const ext = getCvExtension(cvFile.name)
    const contentType =
      cvFile.type && cvFile.type !== "application/octet-stream"
        ? cvFile.type
        : ext === ".pdf"
          ? "application/pdf"
          : ext === ".docx"
            ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            : "application/msword"

    const blob = await put(blobPath, cvFile, {
      access: "public",
      addRandomSuffix: false,
      contentType,
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
      fullName: data.fullName,
      residence: data.residence,
      birthYear: data.birthYear,
      phone: data.phone,
      universityDepartment: data.universityDepartment,
      formationStatus: data.formationStatus,
      appliedBranch: data.appliedBranch,
      experienceLevels: data.experienceLevels,
      totalExperience: data.totalExperience,
      hasPrivateSchoolExperience: data.hasPrivateSchoolExperience === "Evet",
      pedagogicalApproach: data.pedagogicalApproach,
      clubsAndActivities: data.clubsAndActivities,
      references: data.references,
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
      const errBody = (await webhookRes.json().catch(() => ({}))) as {
        error?: string
        message?: string
      }
      console.error("[IK Basvuru] Webhook hatası:", webhookRes.status, errBody)

      let userMessage = "Başvurunuz kaydedilemedi. Lütfen bir süre sonra tekrar deneyin."
      if (webhookRes.status === 401) {
        userMessage =
          "Sistem yapılandırma hatası (güvenlik anahtarı). Lütfen İnsan Kaynakları ile iletişime geçin."
      } else if (webhookRes.status === 400) {
        userMessage =
          "Başvuru verileri sunucuda kabul edilmedi. Referansları tam doldurun veya boş bırakın; sorun sürerse İK ile iletişime geçin."
      } else if (webhookRes.status >= 500) {
        userMessage =
          "Kayıt sunucusu geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin veya İK ile iletişime geçin."
      }

      return NextResponse.json(
        {
          error: userMessage,
          webhookStatus: webhookRes.status,
          webhookDetail: errBody.error ?? errBody.message,
        },
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
