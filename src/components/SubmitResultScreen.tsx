"use client"

type ResultType = "success" | "error" | "loading"

interface SubmitResultScreenProps {
  type: ResultType
  message?: string
  onClose: () => void
}

export function SubmitResultScreen({ type, message, onClose }: SubmitResultScreenProps) {
  const isSuccess = type === "success"
  const isLoading = type === "loading"

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-result-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center">
        <div
          className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${
            isLoading
              ? "bg-slate-100"
              : isSuccess
                ? "bg-emerald-100"
                : "bg-red-100"
          }`}
        >
          {isLoading ? (
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#1e3a5f] border-t-transparent" />
          ) : (
            <span className="text-3xl">{isSuccess ? "✓" : "✕"}</span>
          )}
        </div>

        <h2
          id="submit-result-title"
          className={`text-xl font-bold ${
            isLoading ? "text-slate-800" : isSuccess ? "text-emerald-900" : "text-red-900"
          }`}
        >
          {isLoading
            ? "Başvurunuz gönderiliyor"
            : isSuccess
              ? "Başvuru başarılı"
              : "Başvuru başarısız"}
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {isLoading
            ? "Lütfen bekleyin, bilgileriniz kaydediliyor..."
            : message ||
              (isSuccess
                ? "Başvurunuz alındı. İnsan Kaynakları ekibimiz inceleme sonrası sizinle iletişime geçecektir."
                : "Bir sorun oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyin.")}
        </p>

        {!isLoading && (
          <button
            type="button"
            onClick={onClose}
            className={`mt-8 w-full rounded-xl px-6 py-3 text-sm font-semibold text-white transition ${
              isSuccess
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-[#1e3a5f] hover:bg-[#152a45]"
            }`}
          >
            {isSuccess ? "Tamam" : "Tekrar dene"}
          </button>
        )}
      </div>
    </div>
  )
}
