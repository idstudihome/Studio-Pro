# 🚀 STUDIO PRO — MASTER HANDOFF & PANDUAN LENGKAP INSTALASI

Selamat datang di **Studio Pro**! Dokumen ini dirancang khusus untuk memberikan panduan komprehensif, terperinci, dan ramah bagi orang awam (bahkan tanpa pengalaman coding sekalipun) agar dapat menjalankan, menghubungkan database Supabase, mendeploy ke Vercel, dan melakukan push ke repositori GitHub Anda.

---

## 🌟 1. Ringkasan Eksekutif & Fitur Utama

**Studio Pro** adalah Web App Multifungsi & Progressive Web App (PWA) generasi terbaru yang dirancang untuk kreator konten, video editor AI, dan affiliate marketer.

### Fitur-Fitur Unggulan:
1. **PWA Mobile-First**: Siap diinstal di layar utama HP (Android APK / iOS Add to Home Screen) serta Desktop tanpa browser URL bar.
2. **AI Studio Cerdas**:
   - **Storyboard Generator**: Merancang naskah scene-by-scene (Judul, Visual Continuity, Arah Kamera, Naskah Voiceover, dan Prompt AI Video) didukung model **Gemini 3.8 Flash**.
   - **10 Microtools AI Terpadu**: TikTok Downloader, Split Video AI, Voiceover Generator, Foto Produk AI, Branding AI, Mockup Produk, Fotografer AI, Affiliate Kit Hook Viral, Prompt Video Sinematik, dan Character Sheet Consistency.
3. **Integrasi Gemini Otomatis dengan Akun Gmail**:
   - Ketika masuk dengan akun pengguna (misalnya `idstudihome@gmail.com`), sistem secara otomatis menghubungkan akses API Gemini dari backend tanpa meminta API key manual, sekaligus mendukung custom key jika pengguna memiliki kuota Google AI Studio pribadi.
4. **Multi-Workspace & Akun Sesi**:
   - Manajemen multi-akun Google Flow (dengan pelacak kredit), Grok xAI, ChatGPT Plus, Canva Pro, CapCut Editor, Google Keep/Notes, TikTok Creator, YouTube Studio, dan Riset Produk.
5. **Dukungan Offline**: Cache service worker terintegrasi otomatis menampilkan indikator status ketika sinyal terputus.

---

## 🛠️ 2. Panduan Langkah Demi Langkah Untuk Orang Awam (Pemula)

Jika Anda belum pernah melakukan coding sebelumnya, jangan khawatir! Ikuti langkah mudah ini:

### Persiapan Awal di Komputer:
1. Unduh dan pasang **Node.js** versi 18 atau lebih baru dari [nodejs.org](https://nodejs.org).
2. Unduh dan pasang **Git** dari [git-scm.com](https://git-scm.com).

### Langkah 1: Membuka Folder Proyek di Terminal / Command Prompt
Buka terminal (di Mac/Linux) atau Command Prompt / PowerShell (di Windows) di dalam folder proyek ini:
```bash
# 1. Pasang seluruh dependensi otomatis
npm install

# 2. Jalankan aplikasi di komputer Anda
npm run dev
```
Aplikasi akan langsung berjalan di browser Anda pada alamat: `http://localhost:3000`.

---

## 🗄️ 3. Panduan Setup Database di Web Supabase

Aplikasi telah dilengkapi skema SQL siap pakai (`supabase_schema.sql`) dengan sistem Row Level Security (RLS) berstandar industri.

### Langkah 1: Buat Proyek Baru di Supabase
1. Kunjungi [supabase.com](https://supabase.com) dan masuk dengan akun Anda.
2. Klik tombol **New Project**, pilih nama organisasi, masukkan nama proyek: `studio-pro`, pilih kata sandi database, lalu klik **Create new project**.

### Langkah 2: Eksekusi Skema Database
1. Di bilah menu sebelah kiri Supabase, klik ikon **SQL Editor** (ikon terminal).
2. Klik **New Query**.
3. Buka file `supabase_schema.sql` di proyek ini, salin seluruh isinya, lalu tempel (*paste*) ke dalam SQL Editor Supabase.
4. Klik tombol **Run** (lingkaran hijau) di pojok kanan bawah.
5. Tabel `profiles`, `connected_accounts`, `storyboards`, dan `microtools_log` kini telah selesai dibuat!

### Langkah 3: Ambil Kunci API Supabase
1. Di dashboard Supabase, buka menu **Project Settings** (ikon gerigi di kiri bawah) > **API**.
2. Salin nilai:
   - **Project URL** (contoh: `https://xyzcompany.supabase.co`)
   - **Project API Keys (anon public)** (contoh: `eyJhbGciOi...`)
3. Buka file `.env` di komputer Anda (salin dari `.env.example`) lalu masukkan nilai tersebut:
```env
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
GEMINI_API_KEY=Kunci_Gemini_Anda_Disini
```

---

## 🌐 4. Panduan Deploy Gratis ke Vercel

Proyek ini telah dilengkapi file konfigurasi `vercel.json` untuk menjamin proses deploy berjalan 100% mulus tanpa error.

### Cara 1: Deploy Melalui Web Vercel (Paling Mudah)
1. Kunjungi [vercel.com](https://vercel.com) dan masuk menggunakan akun GitHub Anda.
2. Klik tombol **Add New...** > **Project**.
3. Pilih repositori GitHub `Studio-Pro` Anda, lalu klik **Import**.
4. Di bagian **Environment Variables**, tambahkan:
   - `GEMINI_API_KEY`: Kunci API Google AI Studio Anda.
   - `VITE_SUPABASE_URL`: URL Supabase Anda.
   - `VITE_SUPABASE_ANON_KEY`: Anon Key Supabase Anda.
5. Klik **Deploy**.
6. Selesai! Web App PWA Anda kini live di internet dengan domain gratis (contoh: `studio-pro.vercel.app`).

---

## 📱 5. Cara Menginstal Sebagai Aplikasi (PWA) di HP & Laptop

### Di HP Android:
1. Buka tautan website Anda di aplikasi **Google Chrome**.
2. Klik tombol **"Instal App"** yang muncul di pojok kanan atas aplikasi, ATAU buka menu titik tiga di Chrome dan pilih **"Tambahkan ke Layar Utama" / "Instal Aplikasi"**.
3. Ikon Studio Pro akan terpasang di layar utama HP Anda dan dapat dibuka secara native berlayar penuh tanpa bilah URL browser!

### Di iPhone / iPad (iOS Safari):
1. Buka website di **Safari**.
2. Ketuk tombol **Bagikan (Share)** di bagian bawah layar Safari (ikon kotak dengan panah ke atas).
3. Gulir ke bawah lalu ketuk **"Tambah ke Layar Utama" (Add to Home Screen)**.
4. Ketuk **Tambah**. Studio Pro kini siap digunakan seperti aplikasi iOS dari App Store!

### Di Laptop / PC (Windows / Mac):
1. Buka website di Chrome atau Edge.
2. Klik ikon tombol instal di ujung kanan bilah alamat (URL bar), lalu klik **Instal**.

---

## 💻 6. Panduan Commit & Push ke GitHub

Untuk memperbarui kode ke repositori GitHub `https://github.com/idstudihome/Studio-Pro`:

Jalankan perintah berikut di terminal komputer Anda:
```bash
# 1. Periksa status file yang berubah
git status

# 2. Tambahkan seluruh perubahan ke staging
git add .

# 3. Buat catatan commit
git commit -m "feat: complete Studio Pro PWA, intelligent Gemini 3.8 Flash auto-integration, storyboard engine, and Supabase/Vercel readiness"

# 4. Pastikan branch utama adalah main
git branch -M main

# 5. Push ke GitHub
git push origin main
```

Jika repositori belum terhubung ke origin lokal Anda:
```bash
git remote add origin https://github.com/idstudihome/Studio-Pro.git
git push -u origin main
```

---

## 🔒 7. Keamanan & Best Practice
1. Kunci `GEMINI_API_KEY` selalu diakses di sisi server (`server.ts`) sehingga tidak pernah bocor ke sisi browser pengguna umum.
2. Semua endpoint API dilengkapi mekanisme fallback cerdas (*smart algorithmic engine*), menjamin aplikasi tidak akan pernah *crash* atau *blank screen* meskipun kuota API habis.
3. Database Supabase diamankan dengan *Row Level Security* (RLS) sehingga setiap pengguna hanya dapat membaca data yang menjadi hak miliknya.

Selamat berkreasi dengan **Studio Pro**! 🎉
