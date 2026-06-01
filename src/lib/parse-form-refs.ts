import type { ReferenceInput } from "./references"

export function parseReferences(raw: FormDataEntryValue | null): ReferenceInput[] {
  if (!raw || typeof raw !== "string") return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map((r) => ({
      firstName: String((r as ReferenceInput)?.firstName ?? ""),
      lastName: String((r as ReferenceInput)?.lastName ?? ""),
      title: String((r as ReferenceInput)?.title ?? ""),
      phone: String((r as ReferenceInput)?.phone ?? ""),
    }))
  } catch {
    return []
  }
}
