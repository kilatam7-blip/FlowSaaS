# FlowSaaS

Frontend React + Vite yang memakai Appwrite untuk autentikasi email/password dan menyimpan permintaan demo serta kontak.

Appwrite menyediakan backend melalui SDK resminya. Aplikasi tidak memiliki server Node.js sendiri dan terhubung langsung ke Appwrite dari browser. Database yang dipakai adalah **TablesDB**; formulir menambahkan row ke table `leads`.

## Yang Terhubung

- **Create account** membuat pengguna Appwrite dengan nama, email, dan password.
- **Sign in** membuat sesi Appwrite email/password.
- **Request a demo** menambahkan row bertipe `demo` ke table `leads`.
- **Contact sales** menambahkan row bertipe `contact` ke table `leads`.

Password hanya dikirim ke Appwrite Account dan tidak disimpan di database lead.

## Prasyarat

- Node.js versi 20.19+ atau 22.12+.
- npm.
- Project Appwrite Cloud atau instance Appwrite yang dapat diakses dari browser.

## 1. Siapkan Project Appwrite

Gunakan project Appwrite yang sudah ada, atau buat project baru di [Appwrite Console](https://cloud.appwrite.io/).

1. Buka **Apps** → **Add app** → **Web**. Beri nama, misalnya `FlowSaaS`, lalu masukkan hostname `localhost` tanpa protokol atau nomor port. Tambahkan hostname produksi saat deploy.
2. Buka **Auth** dan pastikan metode **Email/Password** aktif.

Hostname harus cocok dengan URL browser. `localhost:5173` dan `localhost:5174` sama-sama memakai hostname `localhost`.

## 2. Buat Database TablesDB

1. Buka **Databases** → **Create database**.
2. Pilih **TablesDB**. Jangan pilih DocumentsDB; opsi itu belum tersedia di semua region.
3. Beri nama database, misalnya `flowsaas`, lalu tekan **Create database**. Jika form meminta ID khusus, gunakan `flowsaas` juga.
4. Di database tersebut, buat table bernama `leads`. Jika diminta ID table, gunakan `leads`.
5. Buat columns berikut:

| Key column | Type di Console | Required |
| --- | --- | --- |
| `leadType` | Text | Ya |
| `name` | Text | Ya |
| `email` | Text | Ya |
| `company` | Text | Ya |
| `teamSize` | Text | Ya |
| `message` | Text | Ya |

Appwrite membuat column sistem `$createdAt` dan mengisinya otomatis; jangan tambahkan column `createdAt` sendiri. Untuk setiap column di atas, biarkan **Array** dan **At-rest encryption** tidak dicentang. Semua columns wajib karena aplikasi selalu mengirim nilainya; field opsional pada formulir dikirim sebagai string kosong. Type **Text** di Console mengizinkan hingga 16.383 karakter.

Pada permissions table, beri role **Any** izin **Create** agar pengunjung yang belum login dapat mengirim formulir. Jangan beri role **Any** izin **Read**, **Update**, atau **Delete**. Kiriman form bersifat publik; pertimbangkan CAPTCHA atau proteksi spam sebelum peluncuran publik.

## 3. Isi Konfigurasi Lokal

Salin file contoh:

```powershell
Copy-Item .env.example .env.local
```

Isi `.env.local` memakai nilai dari Appwrite Console. Gunakan ID, bukan nama tampilan.

| Variabel | Nilai dari Appwrite |
| --- | --- |
| `VITE_APPWRITE_ENDPOINT` | Endpoint API project. Untuk project Singapore di Appwrite Cloud, gunakan endpoint yang ditampilkan Console, misalnya `https://sgp.cloud.appwrite.io/v1`. |
| `VITE_APPWRITE_PROJECT_ID` | Project ID, terlihat di bagian atas halaman Overview project. |
| `VITE_APPWRITE_DATABASE_ID` | Database ID yang dibuat pada langkah sebelumnya. |
| `VITE_APPWRITE_LEADS_TABLE_ID` | Table ID untuk table `leads`. |

Contoh bentuk file:

```dotenv
VITE_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=isi_project_id
VITE_APPWRITE_DATABASE_ID=isi_database_id
VITE_APPWRITE_LEADS_TABLE_ID=isi_table_id
```

Ganti nilai contoh dengan nilai project Anda. Jangan commit `.env.local`; file tersebut sudah diabaikan Git. Nilai `VITE_*` tersedia di browser, jadi hanya masukkan endpoint dan ID publik. **Jangan masukkan API key, password, atau secret.**

## 4. Jalankan Aplikasi

```powershell
npm ci
npm run dev
```

Buka URL yang dicetak Vite di terminal. Jika port 5173 dipakai, Vite memilih port lain. Setelah mengubah `.env.local`, restart server agar nilai baru dimuat.

Untuk build dan menjalankan preview produksi:

```powershell
npm run build
npm run preview
```

## 5. Verifikasi Integrasi

1. Daftarkan akun lewat tombol **Create free account**. Pengguna akan muncul di daftar Users Appwrite.
2. Coba **Sign in** dengan akun tersebut.
3. Kirim formulir demo atau kontak.
4. Buka **Databases** → database Anda → table `leads`. Setiap kiriman harus muncul sebagai row baru. `leadType` bernilai `demo` atau `contact`, dan `$createdAt` berisi waktu pembuatan otomatis dari Appwrite.

## Pemecahan Masalah

- **Appwrite belum dikonfigurasi**: periksa empat nilai di `.env.local`, lalu restart `npm run dev`.
- **Invalid origin / blocked request**: tambahkan hostname URL aplikasi ke Web app di project Appwrite.
- **Database atau table tidak ditemukan**: periksa Database ID dan Table ID; keduanya harus berasal dari Project ID yang sama.
- **Permission denied saat mengirim form**: pastikan table memberi role **Any** izin **Create**.
- **Column tidak valid atau wajib**: pastikan key, tipe, dan status wajib sama dengan tabel di atas.
- **Email sudah digunakan**: gunakan akun itu untuk sign in atau daftar dengan email berbeda.

## Keamanan

Izin **Any → Create** diperlukan agar formulir publik dapat membuat row tanpa login. Jangan beri izin baca atau ubah data lead kepada publik. Untuk validasi server-side, proteksi spam lebih kuat, atau operasi administratif, gunakan Appwrite Functions/backend terpisah dan simpan secret hanya di environment server.