// =============================================================================
// 1. DATA SEED AWAL (20 BUKU) & AMBANG BATAS (THRESHOLD)
// =============================================================================
// Ambang batas status stok:
// - Stok Habis : stok === 0
// - Menipis    : stok 1 sampai 3
// - Tersedia   : stok >= 4
const THRESHOLD = {
  OUT_OF_STOCK: 0,
  LOW_STOCK: 3
};

let books = [
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

let sortAsc = true; // State arah urutan (true = A-Z, false = Z-A)

// =============================================================================
// 2. DOM SELECTORS
// =============================================================================
const statTotal = document.getElementById("stat-total");
const statLowOut = document.getElementById("stat-low-out");
const statCategories = document.getElementById("stat-categories");
const statCopies = document.getElementById("stat-copies");

const bookList = document.getElementById("book-list");
const searchInput = document.getElementById("search");
const btnSort = document.getElementById("btn-sort");
const formAddBook = document.getElementById("form-add-book");
const statusMessage = document.getElementById("status-message");

// =============================================================================
// 3. LOGIKA HELPER & METHOD ARRAY NATIVE (ES6+)
// =============================================================================

// Helper untuk badge class & text
function getStockBadge(stok) {
  if (stok === THRESHOLD.OUT_OF_STOCK) {
    return { label: "Stok Habis", className: "badge-out-of-stock" };
  }
  if (stok <= THRESHOLD.LOW_STOCK) {
    return { label: "Menipis", className: "badge-low-stock" };
  }
  return { label: "Tersedia", className: "badge-available" };
}

// 4 Kartu Statistik murni dihitung dari array books
function updateStatCards() {
  // Tile 1: Total Buku
  statTotal.textContent = books.length;

  // Tile 2: Stok Menipis + Habis (pakai .filter())
  const lowOrOut = books.filter(b => b.stok <= THRESHOLD.LOW_STOCK).length;
  statLowOut.textContent = lowOrOut;

  // Tile 3: Jumlah Kategori Unik (pakai .map() + Set)
  const uniqueCategories = new Set(books.map(b => b.kategori.trim().toLowerCase()));
  statCategories.textContent = uniqueCategories.size;

  // Tile 4: Total Eksemplar (pakai .reduce())
  const totalCopies = books.reduce((acc, curr) => acc + Number(curr.stok), 0);
  statCopies.textContent = totalCopies;
}

// Helper sanitasi string sederhana untuk menghindari injeksi HTML
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Render isi tabel ke DOM (Filter + Sort berantai)
function renderTable() {
  const query = searchInput.value.trim().toLowerCase();

  // 1. Filter pencarian berdasarkan judul atau penulis (.filter())
  let result = books.filter(book =>
    book.judul.toLowerCase().includes(query) ||
    book.penulis.toLowerCase().includes(query)
  );

  // 2. Pengurutan A-Z / Z-A berdasarkan judul (.sort())
  result.sort((a, b) => {
    const comp = a.judul.localeCompare(b.judul, "id", { sensitivity: "base" });
    return sortAsc ? comp : -comp;
  });

  // Tampilkan pesan kosong jika pencarian tidak menemukan hasil
  if (result.length === 0) {
    bookList.innerHTML = "";
    statusMessage.className = "status-empty";
    statusMessage.textContent = "Buku yang dicari tidak ditemukan.";
    return;
  }

  // Bersihkan pesan status jika data ditemukan
  statusMessage.textContent = "";
  statusMessage.className = "";

  // Render baris ke tabel
  bookList.innerHTML = result.map(book => {
    const badge = getStockBadge(book.stok);
    return `
      <tr>
        <td><strong>${escapeHtml(book.judul)}</strong></td>
        <td>${escapeHtml(book.penulis)}</td>
        <td>${escapeHtml(book.kategori)}</td>
        <td>${book.stok}</td>
        <td><span class="badge ${badge.className}">${badge.label}</span></td>
        <td>
          <button type="button" class="btn btn-danger" onclick="deleteBook(${book.id})">Hapus</button>
        </td>
      </tr>
    `;
  }).join("");
}

// =============================================================================
// 4. EVENT HANDLERS
// =============================================================================

// Tambah Buku Baru
formAddBook.addEventListener("submit", (e) => {
  e.preventDefault();

  const titleInput = document.getElementById("book-title");
  const authorInput = document.getElementById("book-author");
  const categoryInput = document.getElementById("book-category");
  const stockInput = document.getElementById("book-stock");

  const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;

  const newBook = {
    id: newId,
    judul: titleInput.value.trim(),
    penulis: authorInput.value.trim(),
    kategori: categoryInput.value.trim(),
    stok: parseInt(stockInput.value, 10)
  };

  books.push(newBook);
  formAddBook.reset();

  updateStatCards();
  renderTable();
});

// Hapus Buku berdasarkan ID
window.deleteBook = function(id) {
  books = books.filter(b => b.id !== id);
  updateStatCards();
  renderTable();
};

// Pencarian Live
searchInput.addEventListener("input", () => {
  renderTable();
});

// Toggle Urutkan A-Z / Z-A
btnSort.addEventListener("click", () => {
  sortAsc = !sortAsc;
  btnSort.textContent = sortAsc ? "Urutkan A-Z" : "Urutkan Z-A";
  renderTable();
});

// =============================================================================
// 5. INISIALISASI PERTAMA KALI
// =============================================================================
updateStatCards();
renderTable();