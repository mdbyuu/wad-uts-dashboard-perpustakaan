<script setup>
import { ref, computed, onMounted } from 'vue'
import BookRow from './components/BookRow.vue'
import { BATAS_MENIPIS } from './constants'

// 1. URL Backend FastAPI Lokal
const API_URL = "http://127.0.0.1:8000/books"

// 2. Reactive State (ref)
const books = ref([])
const keadaan = ref("loading") // loading | empty | error | success
const queryPencarian = ref("")
const isSortAsc = ref(true)
const pesan = ref({ tipe: "", teks: "" }) // notifikasi hasil tambah/hapus

const form = ref({
  judul: "",
  penulis: "",
  kategori: "",
  stok: 0
})

// Notifikasi singkat yang hilang sendiri setelah 4 detik
let timerPesan = null
function tampilkanPesan(tipe, teks) {
  pesan.value = { tipe, teks }
  clearTimeout(timerPesan)
  timerPesan = setTimeout(() => {
    pesan.value = { tipe: "", teks: "" }
  }, 4000)
}

// 3. GET /books
// senyap = true: refresh data tanpa mengganti tabel dengan teks "Memuat data..."
async function muatBuku({ senyap = false } = {}) {
  if (!senyap) keadaan.value = "loading"
  try {
    const response = await fetch(API_URL)
    if (!response.ok) {
      throw new Error("Status HTTP: " + response.status)
    }
    const data = await response.json()
    books.value = data
    keadaan.value = data.length === 0 ? "empty" : "success"
  } catch (error) {
    console.error("Gagal memuat data:", error)
    keadaan.value = "error"
  }
}

// 4. Computed: 4 kartu statistik (method array native)
const totalBuku = computed(() => books.value.length)
const stokMenipisHabis = computed(() => books.value.filter(b => b.stok <= BATAS_MENIPIS).length)
const totalKategori = computed(() => new Set(books.value.map(b => b.kategori.trim().toLowerCase())).size)
const totalEksemplar = computed(() => books.value.reduce((acc, curr) => acc + Number(curr.stok), 0))

// 5. Computed berantai: filter -> sort
const bukuTersaring = computed(() => {
  const q = queryPencarian.value.toLowerCase().trim()
  if (!q) return books.value
  return books.value.filter(b =>
    b.judul.toLowerCase().includes(q) || b.penulis.toLowerCase().includes(q)
  )
})

const bukuFinal = computed(() => {
  return [...bukuTersaring.value].sort((a, b) => {
    const comp = a.judul.localeCompare(b.judul, "id", { sensitivity: "base" })
    return isSortAsc.value ? comp : -comp
  })
})

// 6. Action handlers (langsung ke backend)
function toggleSort() {
  isSortAsc.value = !isSortAsc.value
}

// POST /books
async function tambahBuku() {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        judul: form.value.judul.trim(),
        penulis: form.value.penulis.trim(),
        kategori: form.value.kategori.trim(),
        stok: Number(form.value.stok)
      })
    })

    if (!response.ok) {
      throw new Error("Gagal menambah buku: " + response.status)
    }

    form.value = { judul: "", penulis: "", kategori: "", stok: 0 }
    await muatBuku({ senyap: true })
    tampilkanPesan("success", "Buku berhasil ditambahkan.")
  } catch (error) {
    console.error(error)
    tampilkanPesan("error", "Gagal menambah buku. Periksa isian form atau koneksi ke server.")
  }
}

// DELETE /books/{id}
async function hapusBuku(id) {
  if (!confirm("Hapus buku ini dari katalog?")) return

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" })

    if (!response.ok) {
      throw new Error("Gagal menghapus buku: " + response.status)
    }

    await muatBuku({ senyap: true })
    tampilkanPesan("success", "Buku berhasil dihapus.")
  } catch (error) {
    console.error(error)
    tampilkanPesan("error", "Gagal menghapus buku. Periksa koneksi ke server.")
  }
}

onMounted(() => {
  muatBuku()
})
</script>

<template>
  <div class="dashboard">
    <header class="app-header">
      <h1>Dashboard Perpustakaan Cakyu University</h1>
    </header>

    <main class="content">
      <!-- 4 Tile Ringkasan -->
      <section class="stat-cards" aria-label="Ringkasan statistik">
        <div class="stat-card">
          <p class="stat-label">Total Buku</p>
          <p class="stat-value">{{ totalBuku }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Stok Menipis + Habis</p>
          <p class="stat-value">{{ stokMenipisHabis }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Jumlah Kategori</p>
          <p class="stat-value">{{ totalKategori }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Total Eksemplar</p>
          <p class="stat-value">{{ totalEksemplar }}</p>
        </div>
      </section>

      <!-- Form Tambah Buku  -->
      <section class="form-section" aria-label="Form tambah buku">
        <h2>Tambah Buku Baru</h2>
        <form @submit.prevent="tambahBuku" class="book-form">
          <div class="field">
            <label for="judul">Judul</label>
            <input id="judul" v-model="form.judul" type="text" required>
          </div>
          <div class="field">
            <label for="penulis">Penulis</label>
            <input id="penulis" v-model="form.penulis" type="text" required>
          </div>
          <div class="field">
            <label for="kategori">Kategori</label>
            <input id="kategori" v-model="form.kategori" type="text" required>
          </div>
          <div class="field">
            <label for="stok">Stok</label>
            <input id="stok" v-model.number="form.stok" type="number" min="0" step="1" required>
          </div>
          <button type="submit" class="btn">Tambah Buku</button>
        </form>
      </section>

      <!-- Notifikasi hasil tambah / hapus -->
      <p
        v-if="pesan.teks"
        :class="['status-msg', pesan.tipe]"
        role="status"
      >
        {{ pesan.teks }}
      </p>

      <!-- Toolbar -->
      <section class="toolbar" aria-label="Pencarian dan aksi">
        <input
          v-model="queryPencarian"
          type="search"
          placeholder="Cari judul atau penulis..."
          aria-label="Cari buku"
        />
        <button type="button" class="btn" @click="toggleSort">
          Urutkan {{ isSortAsc ? 'A-Z' : 'Z-A' }}
        </button>
        <button type="button" class="btn" @click="muatBuku">Refresh Data</button>
      </section>

      <!-- Status pengambilan data -->
      <p v-if="keadaan === 'loading'" class="status-msg loading">Memuat data...</p>
      <p v-else-if="keadaan === 'error'" class="status-msg error">Gagal memuat data. Pastikan backend menyala, lalu coba lagi.</p>
      <p v-else-if="bukuFinal.length === 0" class="status-msg empty">Tidak ada buku ditemukan.</p>

      <!-- Tabel Koleksi Buku -->
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Judul</th>
              <th scope="col">Penulis</th>
              <th scope="col">Kategori</th>
              <th scope="col">Stok</th>
              <th scope="col">Status</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <BookRow
              v-for="buku in bukuFinal"
              :key="buku.id"
              :book="buku"
              @delete-book="hapusBuku"
            />
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard { min-height: 100vh; background: #f3f7f8; color: #1a2b3c; }
.app-header { background: #0b4f6c; color: white; padding: 1rem 1.5rem; }
.app-header h1 { font-size: 1.15rem; }
.content { max-width: 1100px; margin: 0 auto; padding: 1rem; }

/* ===== Tile ringkasan: mobile 1 kolom ===== */
.stat-cards { display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 1.5rem; }
.stat-card { background: white; border-radius: 8px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.stat-label { font-size: 0.85rem; opacity: 0.7; }
.stat-value { font-size: 1.5rem; font-weight: bold; color: #0b4f6c; }

/* ===== Tombol ===== */
.btn { padding: 0.5rem 1rem; border: none; border-radius: 6px; background: #0b4f6c; color: white; cursor: pointer; font-weight: bold; }
.btn:hover { background: #056688; }

/* ===== Form tambah buku: mobile 1 kolom ===== */
.form-section { background: white; border-radius: 8px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
.form-section h2 { margin-bottom: 1rem; color: #0b4f6c; font-size: 1.1rem; }
.book-form { display: grid; grid-template-columns: 1fr; gap: 0.75rem; align-items: end; }
.field { display: flex; flex-direction: column; gap: 0.25rem; }
.field label { font-size: 0.85rem; font-weight: bold; }
.field input { padding: 0.5rem; border: 1px solid #dfe6e9; border-radius: 6px; width: 100%; }

/* ===== Toolbar: boleh membungkus ===== */
.toolbar { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.toolbar input { flex: 1 1 200px; padding: 0.5rem; border: 1px solid #dfe6e9; border-radius: 6px; }

/* ===== Tabel: yang discroll hanya pembungkusnya ===== */
.table-wrap { overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
table { width: 100%; border-collapse: collapse; min-width: 600px; }
th { background: #eef3f5; padding: 0.75rem 1rem; text-align: left; font-size: 0.85rem; }

/* ===== Pesan status ===== */
.status-msg { padding: 1rem; border-radius: 6px; text-align: center; margin-bottom: 1.5rem; background: white; }
.status-msg.loading { color: #0b4f6c; }
.status-msg.error { background: #fee2e2; color: #b91c1c; }
.status-msg.empty { color: #64748b; }
.status-msg.success { background: #d1fadf; color: #05603a; }

/* ===== Tablet: 768px - 1023px ===== */
@media (min-width: 768px) {
  .app-header h1 { font-size: 1.35rem; }
  .stat-cards { grid-template-columns: repeat(2, 1fr); }
  .book-form { grid-template-columns: repeat(2, 1fr); }
  .book-form .btn { grid-column: 1 / -1; }
}

/* ===== Desktop: >= 1024px ===== */
@media (min-width: 1024px) {
  .content { padding: 1.5rem; }
  .stat-cards { grid-template-columns: repeat(4, 1fr); }
  .book-form { grid-template-columns: repeat(4, 1fr) auto; }
  .book-form .btn { grid-column: auto; }
}
</style>