## Tech Stack

| Layer    | Teknologi                                   |
| -------- | ------------------------------------------- |
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend  | Node.js + TypeScript + Express.js           |
| ORM      | Prisma ORM                                  |
| Database | PostgreSQL (Neon Cloud)                     |

---

## Fitur Utama

**Job Seeker:**

- Register & Login sebagai Job Seeker
- Melihat & mencari daftar lowongan pekerjaan
- Melihat detail lowongan dan melamar pekerjaan
- Proteksi: tidak dapat melamar pekerjaan yang sama lebih dari 1 kali
- Melihat riwayat lamaran beserta timeline perubahan status

**Company:**

- Register & Login sebagai Perusahaan
- Membuat lowongan pekerjaan baru
- Melihat daftar kandidat pelamar per lowongan
- Mengubah status kandidat (Applied → Reviewing → Shortlisted → Rejected/Accepted)
- Setiap perubahan status otomatis tercatat ke Application History

---

## Cara Menjalankan Project

### Prerequisites

Install:

- **Node.js**
- **npm**

### 1. Clone Repository

```bash
git clone <URL_REPOSITORY>
cd "Tech Assesment Indokerja"
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Edit file `.env` dan isi `DATABASE_URL` dengan connection string PostgreSQL kamu:

```env
PORT=5000
JWT_SECRET=indokerja_super_secret_jwt_key_development_2026
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```

```bash
# Jalankan migrasi database
npx prisma migrate dev --name init

# (Opsional) Isi data awal untuk testing
npm run db:seed

# Jalankan server backend
npm run dev
```

Server berjalan di **http://localhost:5000**

### 3. Setup Frontend

Buka terminal baru:

```bash
cd frontend

# Install dependencies
npm install

# Jalankan server frontend
npm run dev
```

Aplikasi berjalan di **http://localhost:5173**

---

## 🔑 Akun Demo (Setelah `db:seed`)

| Role       | Email                      | Password    |
| ---------- | -------------------------- | ----------- |
| Company    | hr@tokotech.id             | password123 |
| Company    | recruiter@fintechsolusi.id | password123 |
| Job Seeker | budi.santoso@example.com   | password123 |
| Job Seeker | siti.rahma@example.com     | password123 |

---

## 📁 Struktur Project

```
Tech Assesment Indokerja/
├── backend/
│   ├── prisma/            # Schema & migration Prisma
│   ├── src/
│   │   ├── config/        # Prisma client instance
│   │   ├── controllers/   # Request handler
│   │   ├── middlewares/   # Auth, validator, error handler
│   │   ├── routes/        # Routing endpoint
│   │   └── validations/   # Zod schema
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components (Navbar)
│   │   ├── context/       # AuthContext
│   │   ├── pages/         # Halaman aplikasi
│   │   │   ├── auth/      # Login, Register
│   │   │   ├── seeker/    # Job List, Detail, My Applications
│   │   │   └── company/   # Company Jobs, Create Job, Applicants
│   │   ├── services/      # Axios API client
│   │   └── types/         # TypeScript interfaces
│   └── ...
└── docs/
    └── api-docs.md        # Dokumentasi API
```

---

## 📄 Dokumentasi API

Lihat [docs/api-docs.md](./docs/api-docs.md) untuk detail lengkap seluruh endpoint REST API.
