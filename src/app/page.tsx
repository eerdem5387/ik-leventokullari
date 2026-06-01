import { ApplicationForm } from "@/components/ApplicationForm"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-50">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#c8a96e]">
              Levent Okulları
            </p>
            <h1 className="text-xl font-bold text-[#1e3a5f] sm:text-2xl">İş Başvuru Formu</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 rounded-2xl bg-[#1e3a5f] p-6 text-white shadow-lg sm:p-8">
          <p className="text-sm leading-relaxed text-blue-100/95">
            Levent Okulları bünyesindeki açık pozisyonlar için iş başvuru formudur. Zorunlu
            alanları eksiksiz doldurun; başvurunuz İnsan Kaynakları ekibimiz tarafından
            değerlendirilecektir.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-10">
          <ApplicationForm />
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Levent Okulları — İnsan Kaynakları
        </p>
      </main>
    </div>
  )
}
