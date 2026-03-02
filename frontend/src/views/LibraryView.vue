<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Loader2, BookOpen, Upload } from 'lucide-vue-next'
import { gutenbergSearch, gutenbergImport, uploadPdf } from '@/lib/api.js'
import { useBook } from '@/composables/useBook.js'

const router = useRouter()
const { setBook } = useBook()

const query = ref('')
const lang = ref('de')
const books = ref([])
const loading = ref(false)
const importing = ref(null)
const error = ref(null)
const uploading = ref(false)
const fileInput = ref(null)

const SEARCH_LANGS = [
  { code: 'de', label: 'German' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
  { code: 'it', label: 'Italian' },
  { code: 'ru', label: 'Russian' },
  { code: 'pt', label: 'Portuguese' },
]

let debounceTimer = null

async function search() {
  loading.value = true
  error.value = null
  try {
    books.value = await gutenbergSearch(query.value, lang.value)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function onInput() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => search(), 400)
}

function setLang(code) {
  lang.value = code
  search()
}

async function importBook(book) {
  importing.value = book.id
  error.value = null
  try {
    setBook(await gutenbergImport(book.id))
    router.push('/reader')
  } catch (err) {
    error.value = err.message
    importing.value = null
  }
}

async function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploading.value = true
  error.value = null
  try {
    const title = file.name.replace(/\.[^.]+$/, '')
    setBook(await uploadPdf(file, title))
    router.push('/reader')
  } catch (err) {
    error.value = err.message
  } finally {
    uploading.value = false
    e.target.value = ''
  }
}

onMounted(() => search())
</script>

<template>
  <main class="flex-1 overflow-y-auto bg-black">
    <div class="max-w-4xl mx-auto w-full px-8 py-10 flex flex-col gap-8">
      <!-- Header -->
      <div>
        <div class="flex items-center gap-2 mb-3">
          <div
            style="
              width: 5px;
              height: 5px;
              background: #e03030;
              transform: rotate(45deg);
              box-shadow: 0 0 6px rgba(224,48,48,0.4);
            "
          />
          <span
            style="
              font-family: var(--font-mono);
              font-size: 0.6rem;
              color: #2a2a2a;
              letter-spacing: 0.1em;
              text-transform: uppercase;
            "
          >Library</span>
        </div>
        <h2
          style="
            font-family: var(--font-display);
            font-size: 1.5rem;
            font-weight: 400;
            letter-spacing: -0.025em;
            color: #d8d8d8;
            margin-bottom: 4px;
          "
        >Browse Books</h2>
        <p
          style="
            font-size: 0.72rem;
            color: #2a2a2a;
            font-family: var(--font-mono);
          "
        >Search Project Gutenberg or upload your own PDF</p>
      </div>

      <!-- Language tabs + upload -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-0.5">
          <button
            v-for="l in SEARCH_LANGS"
            :key="l.code"
            class="lang-tab"
            :class="{ 'lang-tab--active': lang === l.code }"
            @click="setLang(l.code)"
          >{{ l.label }}</button>
        </div>

        <button
          class="upload-btn flex items-center gap-1.5"
          :disabled="uploading"
          @click="fileInput.click()"
        >
          <Upload :size="11" />
          {{ uploading ? 'Uploading...' : 'Upload PDF' }}
        </button>
        <input ref="fileInput" type="file" accept=".pdf" class="hidden" @change="onFileChange" />
      </div>

      <!-- Search -->
      <div class="relative">
        <Search
          :size="14"
          style="
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #2a2a2a;
          "
        />
        <input
          v-model="query"
          type="text"
          :placeholder="`Search ${SEARCH_LANGS.find(l => l.code === lang)?.label} books...`"
          class="search-input"
          @input="onInput"
        />
      </div>

      <!-- Error -->
      <p v-if="error" style="font-size: 0.75rem; color: #e03030">{{ error }}</p>

      <!-- Loading -->
      <div v-if="loading" class="flex-1 flex items-center justify-center py-20">
        <Loader2 :size="18" class="animate-spin" style="color: #333333" />
      </div>

      <!-- Results -->
      <div v-else-if="books.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <button
          v-for="book in books"
          :key="book.id"
          :disabled="importing === book.id"
          class="book-card text-left flex flex-col gap-2 disabled:opacity-40"
          @click="importBook(book)"
        >
          <div class="flex items-start gap-2">
            <BookOpen :size="13" style="color: #2a2a2a; flex-shrink: 0; margin-top: 2px" />
            <span
              class="line-clamp-2"
              style="
                font-size: 0.78rem;
                color: #c8c8c8;
                font-weight: 500;
                font-family: var(--font-display);
                letter-spacing: -0.01em;
                line-height: 1.4;
              "
            >{{ book.title }}</span>
          </div>
          <p
            class="line-clamp-1"
            style="
              font-size: 0.65rem;
              color: #333333;
              font-family: var(--font-primary);
            "
          >{{ book.authors.join(', ') || 'Unknown author' }}</p>
          <p
            class="mt-auto"
            style="
              font-size: 0.58rem;
              color: #1e1e1e;
              font-family: var(--font-mono);
            "
          >{{ importing === book.id ? 'Importing...' : `${book.download_count.toLocaleString()} downloads` }}</p>
        </button>
      </div>

      <!-- Empty -->
      <div v-else class="flex flex-col items-center justify-center py-20">
        <div
          style="
            width: 1px;
            height: 40px;
            background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.06), transparent);
            margin-bottom: 20px;
          "
        />
        <p
          style="
            font-family: var(--font-mono);
            font-size: 0.62rem;
            color: #1e1e1e;
            letter-spacing: 0.06em;
          "
        >No books found. Try a different search.</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.lang-tab {
  padding: 5px 10px;
  font-size: 0.65rem;
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
  color: #2a2a2a;
  border-radius: 2px;
  transition: all 0.15s;
  border: 1px solid transparent;
}

.lang-tab:hover {
  color: #555555;
}

.lang-tab--active {
  color: #e03030;
  border-color: rgba(224,48,48,0.3);
  background: rgba(224,48,48,0.04);
}

.upload-btn {
  font-size: 0.65rem;
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
  color: #3a3a3a;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 2px;
  padding: 5px 12px;
  transition: all 0.15s;
}

.upload-btn:hover:not(:disabled) {
  color: #888888;
  border-color: rgba(255,255,255,0.12);
}

.upload-btn:disabled {
  opacity: 0.4;
}

.search-input {
  width: 100%;
  padding: 10px 14px 10px 38px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 4px;
  color: #888888;
  font-size: 0.78rem;
  font-family: var(--font-primary);
  outline: none;
  transition: border-color 0.15s;
}

.search-input:focus {
  border-color: rgba(224,48,48,0.3);
}

.search-input::placeholder {
  color: #222222;
}

.book-card {
  padding: 14px;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 4px;
  background: rgba(255,255,255,0.01);
  transition: all 0.15s;
}

.book-card:hover:not(:disabled) {
  border-color: rgba(224,48,48,0.2);
  background: rgba(255,255,255,0.025);
}
</style>
