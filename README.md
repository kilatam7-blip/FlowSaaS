# FlowSaaS

Landing page untuk FlowSaaS, sebuah konsep platform produktivitas tim all-in-one. Website ini memperkenalkan fitur, paket harga, dan alur pendaftaran melalui pengalaman yang responsif dan interaktif.

🌐 **Demo:** [Kunjungi FlowSaaS](https://flow-saa-s.vercel.app/)

## Fitur Website

- Hero section dengan ajakan untuk memulai trial atau meminta demo.
- Showcase untuk workflow automation, kolaborasi tim, analytics, task management, cloud storage, dan keamanan.
- Preview dashboard produk, testimoni, paket harga, FAQ, dan resource.
- Dialog untuk sign up, sign in, request demo, dan menghubungi sales.
- Integrasi Appwrite untuk autentikasi email/password dan penyimpanan form demo/kontak.

> **Catatan:** Preview dashboard dan deskripsi fitur produk merupakan showcase website. Integrasi backend yang aktif pada proyek ini adalah autentikasi akun serta penyimpanan permintaan demo dan kontak.

## Teknologi

- React 19 dan TypeScript
- Vite 7
- Tailwind CSS 4
- Appwrite Web SDK dengan Account dan TablesDB
- Lucide React

## Menjalankan Secara Lokal

### Prasyarat

- Node.js 20.19+ atau 22.12+
- npm
- Project Appwrite Cloud atau instance Appwrite yang dapat diakses dari browser

### Instalasi

```bash
npm ci
```

Salin template environment:

```powershell
Copy-Item .env.example .env.local
```

Isi `.env.local` dengan endpoint dan ID dari Appwrite Console:

```dotenv
VITE_APPWRITE_ENDPOINT=https://<REGION>.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_LEADS_TABLE_ID=your_leads_table_id
```

Jalankan development server:

```bash
npm run dev
```

Buka URL lokal yang dicetak Vite. Setelah mengubah `.env.local`, restart server agar konfigurasi baru dimuat.

## Konfigurasi Appwrite

1. Buat atau pilih project Appwrite.
2. Tambahkan Web platform dan daftarkan hostname `localhost` tanpa protokol maupun nomor port. Tambahkan hostname situs produksi sebelum deploy.
3. Aktifkan metode autentikasi **Email/Password**.
4. Buat database bertipe **TablesDB**, lalu buat table bernama/ber-ID `leads`.
5. Tambahkan kolom berikut sebagai **Text** dan tandai **Required**:

| Key | Type | Required |
| --- | --- | --- |
| `leadType` | Text | Ya |
| `name` | Text | Ya |
| `email` | Text | Ya |
| `company` | Text | Ya |
| `teamSize` | Text | Ya |
| `message` | Text | Ya |

Jangan tambahkan `createdAt`; Appwrite mengisi kolom sistem `$createdAt` secara otomatis. Biarkan **Array** dan **At-rest encryption** tidak dicentang. Untuk setiap column di atas, aplikasi mengirim nilai; nilai opsional dikirim sebagai string kosong.

6. Beri role **Any** izin **Create** pada table supaya form publik bisa mengirim data. Jangan berikan izin **Read**, **Update**, atau **Delete** kepada publik.
7. Isi nilai endpoint, Project ID, Database ID, dan Table ID pada `.env.local`.

Form demo menyimpan row dengan `leadType: demo`; form kontak memakai `leadType: contact`. Keduanya menyertakan nama, email, pesan, serta company/team size bila tersedia.

## Perintah

```bash
npm run dev      # Jalankan development server
npm run build    # Buat build produksi
npm run preview  # Preview build produksi
```

## Keamanan

Semua variabel `VITE_*` dikirim ke browser. Isikan hanya endpoint dan ID konfigurasi publik; jangan pernah memasukkan API key, password, atau secret Appwrite ke frontend. Permission **Any → Create** memang membuka pengiriman row untuk pengunjung publik, tetapi jangan membuka izin baca atau ubah data. Untuk operasi administratif atau validasi server-side, gunakan Appwrite Functions/backend terpisah dengan secret di environment server.