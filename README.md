# Dashboard Perpustakaan - UTS Web Application Development

Proyek Full-Stack Dashboard Perpustakaan menggunakan **Vue 3 (Frontend)** dan **FastAPI (Backend)**.

## 📌 Daftar Endpoint REST API
| Method | Endpoint | Deskripsi | Status Respon |
| :--- | :--- | :--- | :--- |
| **GET** | `/books` | Mengambil seluruh data buku (mendukung query `?q=...`) | `200 OK` |
| **GET** | `/books/{id}` | Mengambil detail satu buku berdasarkan ID | `200 OK` / `404 Not Found` |
| **POST** | `/books` | Menambahkan data buku baru (Validasi Pydantic) | `201 Created` / `422 Unprocessable Entity` |
| **PATCH** | `/books/{id}` | Memperbarui stok buku | `200 OK` / `404 Not Found` |
| **DELETE** | `/books/{id}` | Menghapus buku dari sistem | `204 No Content` / `404 Not Found` |

## 🚀 Cara Menjalankan Proyek
1. **Jalankan Backend (FastAPI):**
   ```bash
   cd backend-fastapi
   source venv/bin/activate  # atau venv\Scripts\Activate di Windows
   uvicorn main:app --reload
