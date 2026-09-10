# Studio Pro 🎬⚡

Studio Pro adalah Web App & Progressive Web App (PWA) multifungsi untuk kreator konten dan video editor AI dengan integrasi Gemini 3.8 Flash otomatis, Storyboard Maker cerdas, 10 Microtools AI, Multi-Workspace, dan kurikulum kelas kreator.

## 🚀 Fitur Utama
- **AI Storyboard Maker**: Generate visual continuity, camera angles, voiceover, dan prompt sinematik Flow/Kling/Sora dengan Gemini 3.8 Flash.
- **10 Microtools Cerdas**: TikTok Downloader, Split Video, Voiceover Generator, Foto Produk AI, Branding AI, Mockup Produk, Fotografer AI, Affiliate Kit Hook Viral, Prompt Video, dan Character Consistency Sheet.
- **Integrasi Gemini Otomatis**: Pengguna yang masuk dengan akun Gmail (`idstudihome@gmail.com` atau akun pribadi) langsung menikmati kapabilitas AI tanpa perlu setup rumit.
- **Progressive Web App (PWA)**: Siap diinstal di Android, iOS Safari, dan Desktop PC dengan status offline mode.
- **Multi-Workspace**: Google Flow (dengan tracking kredit akun), Grok xAI, ChatGPT Plus, Canva Pro, CapCut Editor, Google Keep, TikTok Creator, YouTube Studio, dan Riset Produk.
- **Supabase & Vercel Ready**: Dilengkapi `supabase_schema.sql` (lengkap dengan Row Level Security/RLS) dan `vercel.json`.

## 🏗️ Arsitektur

Arsitektur target workspace, Google OAuth, Gemini authorization, Supabase data boundary, dan platform adapters didokumentasikan secara visual di:

- [`docs/architecture.md`](./docs/architecture.md) — system architecture, OAuth sequence, AI request path, workspace adapter model, data boundaries, dan production-hardening checklist.

> **Catatan keamanan:** Google Sign-In membuktikan identitas pengguna, tetapi tidak otomatis memberikan otorisasi untuk setiap Google API. Akses Gemini harus melalui authorization flow/scopes yang memang didukung. Credential provider harus tetap berada di server-side boundary dan tidak diekspos ke browser.

## 📦 Menjalankan Proyek
```bash
# Instal dependensi
npm install

# Jalankan dev server (Port 3000)
npm run dev

# Build untuk produksi
npm run build
```

## 📖 Panduan Lengkap
Silakan baca [MASTERHANDOFF.md](./MASTERHANDOFF.md) untuk petunjuk langkah demi langkah bagi orang awam mengenai instalasi, eksekusi di Web Supabase, deploy di Vercel, dan panduan commit & push ke GitHub.
