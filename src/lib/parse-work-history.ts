import type { WorkHistoryInput } from "./work-history"

export function parseWorkHistory(raw: FormDataEntryValue | null): WorkHistoryInput[] {
  if (!raw || typeof raw !== "string") return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map((e) => ({
      institutionName: String((e as WorkHistoryInput)?.institutionName ?? ""),
      phone: String((e as WorkHistoryInput)?.phone ?? ""),
      directorName: String((e as WorkHistoryInput)?.directorName ?? ""),
    }))
  } catch {
    return []
  }
}
