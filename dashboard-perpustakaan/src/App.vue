<script setup>
import { ref, computed, onMounted } from 'vue'
import BookRow from './components/BookRow.vue'

// 1. In-Memory 20 Data Seed
const SEED_BOOKS = [
  { id: 1, judul: "Clean Code", penulis: "Robert C. Martin", kategori: "Teknologi", stok: 8 },
  { id: 2, judul: "The Pragmatic Programmer", penulis: "Andrew Hunt", kategori: "Teknologi", stok: 0 },
  { id: 3, judul: "Designing Data-Intensive Applications", penulis: "Martin Kleppmann", kategori: "Teknologi", stok: 2 },
  { id: 4, judul: "Bumi Manusia", penulis: "Pramoedya Ananta Toer", kategori: "Sastra", stok: 12 },
  { id: 5, judul: "Laskar Pelangi", penulis: "Andrea Hirata", kategori: "Sastra", stok: 1 },
  { id: 6, judul: "Cantik Itu Luka", penulis: "Eka Kurniawan", kategori: "Sastra", stok: 0 },
  { id: 7, judul: "Atomic Habits", penulis: "James Clear", kategori: "Pengembangan Diri", stok: 15 },
  { id: 8, judul: "Filosofi Teras", penulis: "Henry Manampiring", kategori: "Pengembangan Diri", stok: 3 },
  { id: 9, judul: "Deep Work", penulis: "Cal Newport", kategori: "Pengembangan Diri", stok: 0 },
  { id: 10, judul: "Sapiens: Riwayat Singkat Umat Manusia", penulis: "Yuval Noah Harari", kategori: "Sejarah", stok: 6 },
  { id: 11, judul: "Guns, Germs, and Steel", penulis: "Jared Diamond", kategori: "Sejarah", stok: 2 },
  { id: 12, judul: "Nusantara: Sejarah Indonesia", penulis: "Bernard H.M. Vlekke", kategori: "Sejarah", stok: 4 },
  { id: 13, judul: "The Psychology of Money", penulis: "Morgan Housel", kategori: "Bisnis", stok: 10 },
  { id: 14, judul: "Zero to One", penulis: "Peter Thiel", kategori: "Bisnis", stok: 2 },
  { id: 15, judul: "Good to Great", penulis: "Jim Collins", kategori: "Bisnis", stok: 0 },
  { id: 16, judul: "Cosmos", penulis: "Carl Sagan", kategori: "Sains", stok: 5 },
  { id: 17, judul: "A Brief History of Time", penulis: "Stephen Hawking", kategori: "Sains", stok: 1 },
  { id: 18, judul: "The Selfish Gene", penulis: "Richard Dawkins", kategori: "Sains", stok: 0 },
  { id: 19, judul: "Introduction to Algorithms", penulis: "Thomas H. Cormen", kategori: "Teknologi", stok: 4 },
  { id: 20, judul: "Man's Search for Meaning", penulis: "Viktor E. Frankl", kategori: "Psikologi", stok: 7 }
]

// 2. Reactive State (ref)
const books = ref([])
const keadaan = ref("idle") // idle | loading | empty | error | success
const queryPencarian = ref("")
const isSortAsc = ref(true)

const form = ref({
  judul: "",
  penulis: "",
  kategori: "",
  stok: 0
})

// 3. Mengambil Data Asinkron (Async Request State Pattern)
async function muatBuku() {
  keadaan.value = "loading"
  try {
    // Simulasi jeda network
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const localData = localStorage.getItem("books_data")
    if (!localData) {
      localStorage.setItem("books_data", JSON.stringify(SEED_BOOKS))
      books.value = SEED_BOOKS
    } else {
      books.value = JSON.parse(localData)
    }

    keadaan.value = books.value.length === 0 ? "empty" : "success"
  } catch (error) {
    keadaan.value = "error"
  }
}

// 4. Computed Properties: 4 Kartu Statistik (Array Native Methods)
const totalBuku = computed(() => books.value.length)
const stokMenipisHabis = computed(() => books.value.filter(b => b.stok <= 3).length)
const totalKategori = computed(() => new Set(books.value.map(b => b.kategori.trim().toLowerCase())).size)
const totalEksemplar = computed(() => books.value.reduce((acc, curr) => acc + Number(curr.stok), 0))

// 5. Computed Berantai: Filter -> Sort
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

// 6. Action Handlers
function toggleSort() {
  isSortAsc.value = !isSortAsc.value
}

function tambahBuku() {
  const newId = books.value.length > 0 ? Math.max(...books.value.map(b => b.id)) + 1 : 1
  const itemBaru = {
    id: newId,
    judul: form.value.judul.trim(),
    penulis: form.value.penulis.trim(),
    kategori: form.value.kategori.trim(),
    stok: Number(form.value.stok)
  }
  
  books.value.push(itemBaru)
  localStorage.setItem("books_data", JSON.stringify(books.value))
  
  // Reset Form
  form.value = { judul: "", penulis: "", kategori: "", stok: 0 }
  keadaan.value = "success"
}

function hapusBuku(id) {
  books.value = books.value.filter(b => b.id !== id)
  localStorage.setItem("books_data", JSON.stringify(books.value))
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

      <!-- Toolbar -->
      <section class="toolbar">
        <input 
          v-model="queryPencarian" 
          type="search" 
          placeholder="Cari judul atau penulis..."
        />
        <button type="button" class="btn" @click="toggleSort">
          Urutkan {{ isSortAsc ? 'A-Z' : 'Z-A' }}
        </button>
        <button type="button" class="btn" @click="muatBuku">Refresh Data</button>
      </section>

      <!-- Request State Feedback (v-if / v-else-if / v-else) -->
      <p v-if="keadaan === 'loading'" class="status-msg loading">Memuat data...</p>
      <p v-else-if="keadaan === 'error'" class="status-msg error">Gagal memuat data. Coba lagi.</p>
      <p v-else-if="bukuFinal.length === 0" class="status-msg empty">Tidak ada buku ditemukan.</p>

      <!-- Tabel Koleksi Buku -->
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Judul</th>
              <th>Penulis</th>
              <th>Kategori</th>
              <th>Stok</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <!-- Render Child Component dengan Props & Emits -->
            <BookRow 
              v-for="buku in bukuFinal" 
              :key="buku.id" 
              :book="buku" 
              @delete-book="hapusBuku"
            />
          </tbody>
        </table>
      </div>

      <!-- Form Tambah Buku -->
      <section class="form-section">
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
            <input id="stok" v-model.number="form.stok" type="number" min="0" required>
          </div>
          <button type="submit" class="btn">Tambah Buku</button>
        </form>
      </section>
    </main>
  </div>
</template>

<style scoped>
.dashboard { min-height: 100vh; background: #f3f7f8; color: #1a2b3c; }
.app-header { background: #0b4f6c; color: white; padding: 1rem 1.5rem; }
.content { max-width: 1100px; margin: 0 auto; padding: 1.5rem; }

.stat-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.stat-card { background: white; border-radius: 8px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.stat-label { font-size: 0.85rem; opacity: 0.7; }
.stat-value { font-size: 1.5rem; font-weight: bold; color: #0b4f6c; }

.toolbar { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.toolbar input { flex: 1 1 200px; padding: 0.5rem; border: 1px solid #dfe6e9; border-radius: 6px; }

.btn { padding: 0.5rem 1rem; border: none; border-radius: 6px; background: #0b4f6c; color: white; cursor: pointer; font-weight: bold; }
.btn:hover { background: #056688; }

.table-wrap { overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
table { width: 100%; border-collapse: collapse; min-width: 600px; }
th { background: #eef3f5; padding: 0.75rem 1rem; text-align: left; font-size: 0.85rem; }

.status-msg { padding: 1rem; border-radius: 6px; text-align: center; margin-bottom: 1.5rem; background: white; }
.status-msg.loading { color: #0b4f6c; }
.status-msg.error { background: #fee2e2; color: #b91c1c; }
.status-msg.empty { color: #64748b; }

.form-section { background: white; border-radius: 8px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.form-section h2 { margin-bottom: 1rem; color: #0b4f6c; font-size: 1.1rem; }
.book-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) auto; gap: 0.75rem; align-items: end; }
.field { display: flex; flex-direction: column; gap: 0.25rem; }
.field label { font-size: 0.85rem; font-weight: bold; }
.field input { padding: 0.5rem; border: 1px solid #dfe6e9; border-radius: 6px; }
</style>