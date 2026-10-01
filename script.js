// =============================================================================
// 1. KONFIGURASI, DATA SEED AWAL & THRESHOLD
// =============================================================================
const THRESHOLD = {
  OUT_OF_STOCK: 0,
  LOW_STOCK: 3
};

const INITIAL_BOOKS = [
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
];

// State lokal aplikasi
let books = [];
let sortAsc = true;
let isSimulatingError = false; // Ubah ke true jika ingin mengetes UI error

// =============================================================================
// 2. MOCK API SERVICE (MENSIMULASIKAN KONTRAK ASYNCHRONOUS REST API)
// =============================================================================
const mockApi = {
  getStorage() {
    const raw = localStorage.getItem("library_books");
    if (!raw) {
      localStorage.setItem("library_books", JSON.stringify(INITIAL_BOOKS));
      return INITIAL_BOOKS;
    }
    return JSON.parse(raw);
  },

  async fetchAll() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (isSimulatingError) {
          reject(new Error("Koneksi ke server terputus (HTTP 500 Network Error)"));
        } else {
          resolve(this.getStorage());
        }
      }, 500); // Latensi jaringan 500ms
    });
  },

  async create(newBook) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const current = this.getStorage();
        const nextId = current.length > 0 ? Math.max(...current.map(b => b.id)) + 1 : 1;
        const entry = { ...newBook, id: nextId };
        const updated = [...current, entry];
        localStorage.setItem("library_books", JSON.stringify(updated));
        resolve(entry);
      }, 300);
    });
  },

  async remove(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const current = this.getStorage();
        const updated = current.filter(b => b.id !== id);
        localStorage.setItem("library_books", JSON.stringify(updated));
        resolve({ success: true });
      }, 300);
    });
  }
};

// =============================================================================
// 3. DOM SELECTORS
// =============================================================================
const statTotal = document.getElementById("stat-total");
const statLowOut = document.getElementById("stat-low-out");
const statCategories = document.getElementById("stat-categories");
const statCopies = document.getElementById("stat-copies");

const bookList = document.getElementById("book-list");
const searchInput = document.getElementById("search");
const btnSort = document.getElementById("btn-sort");
const btnRefresh = document.getElementById("btn-refresh");
const formAddBook = document.getElementById("form-add-book");
const statusMessage = document.getElementById("status-message");

// =============================================================================
// 4. UI STATE MANAGER (Loading, Empty, Error, Success)
// =============================================================================
function setUiState(type, message = "") {
  statusMessage.className = "";
  if (!type) {
    statusMessage.textContent = "";
    return;
  }

  switch (type) {
    case "loading":
      statusMessage.className = "status-loading";
      statusMessage.textContent = "Sedang mengambil data dari katalog...";
      break;
    case "error":
      statusMessage.className = "status-error";
      statusMessage.textContent = message || "Terjadi kesalahan saat menghubungi server.";
      break;
    case "empty":
      statusMessage.className = "status-empty";
      statusMessage.textContent = message || "Data buku tidak ditemukan.";
      break;
    case "success":
      statusMessage.className = "status-success";
      statusMessage.textContent = message;
      setTimeout(() => {
        // Hilangkan pesan notifikasi sukses setelah 2.5 detik
        if (statusMessage.className === "status-success") {
          statusMessage.textContent = "";
          statusMessage.className = "";
        }
      }, 2500);
      break;
  }
}

// =============================================================================
// 5. DATA COMPUTATION & RENDERING
// =============================================================================
function getStockBadge(stok) {
  if (stok === THRESHOLD.OUT_OF_STOCK) {
    return { label: "Stok Habis", className: "badge-out-of-stock" };
  }
  if (stok <= THRESHOLD.LOW_STOCK) {
    return { label: "Menipis", className: "badge-low-stock" };
  }
  return { label: "Tersedia", className: "badge-available" };
}

function updateStatCards() {
  statTotal.textContent = books.length;
  statLowOut.textContent = books.filter(b => b.stok <= THRESHOLD.LOW_STOCK).length;
  
  const uniqueCategories = new Set(books.map(b => b.kategori.trim().toLowerCase()));
  statCategories.textContent = uniqueCategories.size;

  const totalCopies = books.reduce((acc, curr) => acc + Number(curr.stok), 0);
  statCopies.textContent = totalCopies;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTable() {
  const query = searchInput.value.trim().toLowerCase();

  let filtered = books.filter(book =>
    book.judul.toLowerCase().includes(query) ||
    book.penulis.toLowerCase().includes(query)
  );

  filtered.sort((a, b) => {
    const comp = a.judul.localeCompare(b.judul, "id", { sensitivity: "base" });
    return sortAsc ? comp : -comp;
  });

  if (filtered.length === 0) {
    bookList.innerHTML = "";
    setUiState("empty", "Tidak ada buku yang sesuai dengan pencarian.");
    return;
  }

  // Jika ada data yang tampil dan bukan status error/success, bersihkan area status
  if (!statusMessage.classList.contains("status-error") && !statusMessage.classList.contains("status-success")) {
    setUiState(null);
  }

  bookList.innerHTML = filtered.map(book => {
    const badge = getStockBadge(book.stok);
    return `
      <tr>
        <td><strong>${escapeHtml(book.judul)}</strong></td>
        <td>${escapeHtml(book.penulis)}</td>
        <td>${escapeHtml(book.kategori)}</td>
        <td>${book.stok}</td>
        <td><span class="badge ${badge.className}">${badge.label}</span></td>
        <td>
          <button type="button" class="btn btn-danger" onclick="handleDeleteBook(${book.id})">Hapus</button>
        </td>
      </tr>
    `;
  }).join("");
}

// =============================================================================
// 6. ASYNCHRONOUS CONTROLLERS (async/await + try/catch)
// =============================================================================

// Mengambil seluruh data buku
async function loadBooks() {
  setUiState("loading");
  bookList.innerHTML = "";

  try {
    const data = await mockApi.fetchAll();
    books = data;
    updateStatCards();
    renderTable();
  } catch (error) {
    updateStatCards();
    setUiState("error", error.message);
  }
}

// Menambah data buku baru
formAddBook.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titleInput = document.getElementById("book-title");
  const authorInput = document.getElementById("book-author");
  const categoryInput = document.getElementById("book-category");
  const stockInput = document.getElementById("book-stock");

  const payload = {
    judul: titleInput.value.trim(),
    penulis: authorInput.value.trim(),
    kategori: categoryInput.value.trim(),
    stok: parseInt(stockInput.value, 10)
  };

  try {
    setUiState("loading");
    await mockApi.create(payload);
    formAddBook.reset();
    await loadBooks();
    setUiState("success", `Buku "${payload.judul}" berhasil disimpan!`);
  } catch (error) {
    setUiState("error", "Gagal menyimpan buku ke database.");
  }
});

// Menghapus data buku
window.handleDeleteBook = async function(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus buku ini dari katalog?")) return;

  try {
    setUiState("loading");
    await mockApi.remove(id);
    await loadBooks();
    setUiState("success", "Buku berhasil dihapus.");
  } catch (error) {
    setUiState("error", "Gagal menghapus data buku.");
  }
};

// =============================================================================
// 7. EVENT LISTENERS
// =============================================================================
searchInput.addEventListener("input", () => {
  renderTable();
});

btnSort.addEventListener("click", () => {
  sortAsc = !sortAsc;
  btnSort.textContent = sortAsc ? "Urutkan A-Z" : "Urutkan Z-A";
  renderTable();
});

btnRefresh.addEventListener("click", () => {
  loadBooks();
});

// Eksekusi pemanggilan data saat dokumen selesai dimuat
loadBooks();