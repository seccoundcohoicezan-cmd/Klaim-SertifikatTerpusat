# Klaim-SertifikatTerpusat — portal SKALA

Frontend statis **SKALA (Sistem Klaim Beasiswa Universitas STEKOM)**: https://skala.stekom.ac.id
Tanpa build step; di-host di Vercel, deploy otomatis setiap ada commit di `main`.
Backend: Google Apps Script Web App (repo sinkron clasp terpisah).

## Halaman

| Berkas | URL | Isi | Aksi backend |
|---|---|---|---|
| `index.html` | `/`, `/KODE-SERTIFIKAT` | Beranda, verifikasi Turnstile, cari & ajukan sertifikat, banner, FAQ | `konfigurasi`, `cari` (GET) · `verifikasi`, `submitPengajuan`, `tandaiWA`, `klikBanner` (POST) |
| `lacak.html` | `/lacak` | Cek progres pengajuan, kirim NIM | `lacak`, `pantauLacak` (GET) · `kirimNim` (POST) |
| `testimoni.html` | `/testimoni` | Kartu testimoni penerima | `testimoni` (GET) |
| `ajukankategorisertifikat.html` | `/ajukankategorisertifikat` | Usulan kategori sertifikat, dikirim ke WhatsApp admin | — |
| `assets/skala-turunan.js/.css` | — | Skrip bersama `lacak` & `testimoni` (gerbang verifikasi, banner, analitik) | `konfigurasi`, `verifikasi`, `klikBanner` |
| `sw.js` | — | Service worker: HTML network-first, `/assets/` dari cache | — |
| `manifest.webmanifest` | — | Manifest PWA (nama, ikon, warna) | — |

## Checklist rilis

1. **URL backend ada di DUA tempat** dan harus sama:
   `index.html` (blok KONFIGURASI, `API_URL_PRODUKSI`) dan `assets/skala-turunan.js` (baris atas).
   URL ini hanya berubah bila membuat deployment Web App BARU. Redeploy versi baru
   pada deployment yang sama (Kelola deployment → Edit → Versi baru) tidak mengubah URL.
2. **Server uji:** isi `API_URL_UJI` di kedua tempat dengan URL Web App salinan uji. Alamat pratinjau
   Vercel otomatis memakai server uji, sedangkan `skala.stekom.ac.id` tetap memakai server resmi.
3. **Aset di `/assets/` di-cache 1 tahun (immutable).** Setiap mengubah berkas di sana, naikkan
   `?v=` di semua halaman yang memuatnya, juga di daftar `ASET` pada `sw.js`.
4. **Daftar `ASET` di `sw.js` berubah** → naikkan `VERSI` (mis. `skala-v20` → `skala-v21`).
5. Rahasia (kunci API, token Telegram, secret Turnstile) **tidak pernah** ditaruh di repo ini.
   Semuanya ada di Script Properties backend. Site key Turnstile & ID analitik dikirim lewat `aksi=konfigurasi`.
