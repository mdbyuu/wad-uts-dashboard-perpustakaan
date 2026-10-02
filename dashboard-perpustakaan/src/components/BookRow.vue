<script setup>
import { computed } from 'vue'
import { BATAS_MENIPIS } from '../constants'

// Menerima data 1 buku dari parent (App.vue) lewat props
const props = defineProps({
  book: {
    type: Object,
    required: true
  }
})

// Custom event untuk mengirim aksi hapus kembali ke parent
const emit = defineEmits(['delete-book'])

// Badge dihitung otomatis dari stok
const badge = computed(() => {
  const stok = props.book.stok
  if (stok === 0) return { label: 'Stok Habis', class: 'badge-out' }
  if (stok <= BATAS_MENIPIS) return { label: 'Menipis', class: 'badge-low' }
  return { label: 'Tersedia', class: 'badge-ok' }
})
</script>

<template>
  <tr>
    <td><strong>{{ book.judul }}</strong></td>
    <td>{{ book.penulis }}</td>
    <td><span class="category-tag">{{ book.kategori }}</span></td>
    <td>{{ book.stok }}</td>
    <td>
      <span :class="['badge', badge.class]">{{ badge.label }}</span>
    </td>
    <td>
      <button
        type="button"
        class="btn-delete"
        @click="emit('delete-book', book.id)"
      >
        Hapus
      </button>
    </td>
  </tr>
</template>

<style scoped>
td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}
.category-tag {
  background: #eef3f5;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}
.badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge-ok { background: #d1fadf; color: #05603a; }
.badge-low { background: #fef0c7; color: #93370d; }
.badge-out { background: #fee4e2; color: #b42318; }
.btn-delete {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
}
.btn-delete:hover {
  background: #dc2626;
  color: white;
}
</style> 