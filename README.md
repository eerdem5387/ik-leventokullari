# ik-leventokullari

Levent Okulları öğretmen adayı başvuru formu (ayrı subdomain / Vercel projesi).

Başvurular yerel veritabanında tutulmaz; CV Vercel Blob’a yüklenir ve yönetim sistemine webhook ile iletilir.

## Kurulum

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Ortam değişkenleri

| Değişken | Açıklama |
|----------|----------|
| `YONETIM_WEBHOOK_URL` | okul-yonetim-sistemi `/api/webhook/ik-basvuru` adresi |
| `HR_WEBHOOK_SECRET` | Yönetim sistemindeki `HR_WEBHOOK_SECRET` ile aynı olmalı |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (CV yükleme) |

## Akış

1. Aday formu doldurur ve CV yükler.
2. `POST /api/basvuru` CV’yi Blob’a kaydeder.
3. Webhook ile başvuru yönetim veritabanına yazılır.
