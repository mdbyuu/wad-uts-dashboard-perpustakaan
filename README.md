# 📚 Dashboard Perpustakaan - Full-Stack Web Application

Proyek UTS **Web Application Development** berupa Dashboard Manajemen Perpustakaan interaktif yang dibangun menggunakan **Vue 3 (Frontend)** dan **FastAPI (Backend)** dengan integrasi REST API penuh, validasi data Pydantic, serta manajemen state reaktif.

---

## 🛠️ Teknologi yang Digunakan
* **Frontend:** Vue 3 (Composition API), Vite, CSS Modern (Responsive Layout).
* **Backend:** Python, FastAPI, Uvicorn, Pydantic (Validasi Skema).
* **Penyimpanan Data:** JSON-based Seed Data / In-Memory Management.

---

## 📌 Daftar Endpoint REST API
| Method | Endpoint | Deskripsi | Status Respon |
| :--- | :--- | :--- | :--- |
| **GET** | `/books` | Mengambil seluruh data buku (mendukung pencarian query `?q=...`) | `200 OK` |
| **GET** | `/books/{id}` | Mengambil detail satu buku berdasarkan ID | `200 OK` / `404 Not Found` |
| **POST** | `/books` | Menambahkan data buku baru dengan validasi Pydantic | `201 Created` / `422 Unprocessable Entity` |
| **PATCH** | `/books/{id}` | Memperbarui stok buku tertentu | `200 OK` / `404 Not Found` |
| **DELETE** | `/books/{id}` | Menghapus buku dari sistem | `204 No Content` / `404 Not Found` |

---

## 🚀 Panduan Menjalankan Proyek

Pastikan Anda menjalankan kedua layanan (Backend dan Frontend) secara bersamaan di terminal yang terpisah.

### 1. Menjalankan Backend (FastAPI)
Buka terminal pertama, lalu jalankan perintah berikut:
```bash
cd backend-fastapi

# Aktifkan virtual environment
# Untuk macOS/Linux:
source venv/bin/activate  
# Untuk Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Jalankan server Uvicorn
uvicorn main:app --reload
Server backend akan berjalan di: http://127.0.0.1:8000

Dokumentasi interaktif (Swagger UI) dapat diakses di: http://127.0.0.1:8000/docs

2. Menjalankan Frontend (Vue 3)
Buka terminal kedua di folder root proyek, lalu jalankan perintah berikut:

Bash
cd dashboard-perpustakaan

# Install dependencies (jika belum)
npm install

# Jalankan server development Vite
npm run dev
Aplikasi frontend dapat diakses melalui browser di: http://localhost:5173

✨ Fitur Utama
Live Search & Sorting Berantai: Memfilter judul/penulis secara real-time dan mengurutkan data (A-Z / Z-A).

Statistik Reaktif: Menampilkan total buku, status stok menipis/habis, jumlah kategori, dan total eksemplar secara otomatis.

Notifikasi Status & Error Handling: Sistem pemberitahuan umpan balik otomatis yang elegan serta penanganan error koneksi server.

Desain Responsif: Tata letak fleksibel yang optimal diakses pada perangkat mobile, tablet, hingga desktop.
