# İK Başvuru Sitesi — Deploy Rehberi

Bu proje veritabanı kullanmaz. Form → Vercel Blob (CV) → yönetim sistemi webhook.

## 1. Yönetim sistemini hazırlayın (önce)

1. `okul-yonetim-sistemi` deploy edilmiş olsun.
2. Vercel / sunucuda migration:
   ```bash
   npx prisma migrate deploy
   ```
3. Yönetim projesi Environment Variables:
   ```env
   HR_WEBHOOK_SECRET=uzun-rastgele-gizli-anahtar-en-az-32-karakter
   ```
4. Deploy sonrası webhook URL:
   `https://yonetim.leventokullari.com/api/webhook/ik-basvuru`

## 2. ik-leventokullari Vercel projesi

1. [vercel.com](https://vercel.com) → **Add New Project**
2. Repo: `ik-leventokullari` (GitHub’a push edin)
3. Framework: Next.js (otomatik)
4. Environment Variables:

   | Değişken | Değer |
   |----------|--------|
   | `YONETIM_WEBHOOK_URL` | `https://yonetim.leventokullari.com/api/webhook/ik-basvuru` |
   | `HR_WEBHOOK_SECRET` | Yönetimdeki ile **aynı** |
   | `BLOB_READ_WRITE_TOKEN` | Vercel Storage → Blob → token |

5. **Deploy**

## 3. Subdomain

Vercel → Project → Settings → Domains:

- `ik.leventokullari.com` (veya `kariyer.leventokullari.com`)

DNS’te CNAME → `cname.vercel-dns.com`

## 4. Yetkilendirme (yönetim paneli)

1. `yonetim.leventokullari.com` → giriş
2. **Yetkilendirme** → ilgili personele **İK Öğretmen Başvuruları** → Görüntüle / Düzenle / Dışa aktar
3. Menü: **İK Başvuruları** (`/ik-basvurular`)

## 5. Test

1. Subdomain’de formu doldurup gönderin.
2. Yönetim → İK Başvuruları’nda kayıt görünmeli.
3. Hata olursa Vercel → Functions → Logs (`preview-pdf` değil, `webhook/ik-basvuru` ve `api/basvuru`).
