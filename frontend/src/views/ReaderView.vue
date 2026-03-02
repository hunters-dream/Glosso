<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import WordToken from '@/components/WordToken.vue'
import TranslationBubble from '@/components/TranslationBubble.vue'
import WordBank from '@/components/WordBank.vue'
import { translateWord } from '@/lib/api.js'
import { useBook } from '@/composables/useBook.js'
import { useLanguage } from '@/composables/useLanguage.js'
import { useWords } from '@/composables/useWords.js'
import { useSettings } from '@/composables/useSettings.js'

const router = useRouter()
const { book } = useBook()
const { targetLang } = useLanguage()
const { addWord, isWordSaved, getWordStatus } = useWords()
const { openSettings } = useSettings()

const currentPage = ref(0)
const selectedWord = ref(null)
const translation = ref(null)
const translating = ref(false)
const anchorRect = ref(null)

onMounted(() => {
  if (!book.value) router.replace('/library')
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

function handleKeyDown(e) {
  if (e.target !== document.body) return
  if (e.key === 'ArrowRight') nextPage()
  if (e.key === 'ArrowLeft') prevPage()
  if (e.key === 's' || e.key === 'S') openSettings('settings')
  if (e.key === 'h' || e.key === 'H') openSettings('help')
}

const pageText = computed(() => book.value?.pages[currentPage.value] ?? '')
const totalPages = computed(() => book.value?.pages.length ?? 0)
const wordCount = computed(() => pageText.value.split(/\s+/).filter(Boolean).length)

function tokenize(text) {
  return text.split(/([A-Za-zÀ-ÖØ-öø-ÿÄÖÜäöüß]+)/).filter(t => t !== '')
}
function isWord(token) {
  return /^[A-Za-zÀ-ÖØ-öø-ÿÄÖÜäöüß]+$/.test(token)
}

async function selectWord(word, event) {
  if (selectedWord.value === word) { closeBubble(); return }

  const el = event.target
  anchorRect.value = el.getBoundingClientRect()

  selectedWord.value = word
  translation.value = null
  translating.value = true
  try {
    translation.value = await translateWord(word, targetLang.value)
  } finally {
    translating.value = false
  }
}

function closeBubble() {
  selectedWord.value = null
  translation.value = null
  anchorRect.value = null
}

function onSaveWord() {
  if (selectedWord.value && translation.value) {
    addWord(selectedWord.value, translation.value, 'new')
    closeBubble()
  }
}

function onKnowWord() {
  if (selectedWord.value && translation.value) {
    addWord(selectedWord.value, translation.value, 'known')
    closeBubble()
  }
}

function prevPage() {
  if (currentPage.value > 0) { currentPage.value--; closeBubble() }
}
function nextPage() {
  if (currentPage.value < totalPages.value - 1) { currentPage.value++; closeBubble() }
}
</script>

<template>
  <div v-if="book" class="flex-1 flex overflow-hidden relative">
    <!-- Main reader area -->
    <main class="flex-1 overflow-y-auto bg-black">
      <!-- Top bar -->
      <div
        class="sticky top-0 flex items-center justify-between px-8 z-10"
        style="
          height: 56px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          background: rgba(0,0,0,0.92);
          backdrop-filter: blur(12px);
        "
      >
        <div
          style="
            font-family: var(--font-mono);
            font-size: 0.62rem;
            color: #272727;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          "
        >Page {{ currentPage + 1 }} / {{ totalPages }}</div>

        <div class="flex items-center gap-2">
          <button
            :disabled="currentPage <= 0"
            class="reader-nav-btn"
            @click="prevPage"
          >
            <ChevronLeft :size="12" />
            Prev
          </button>
          <button
            :disabled="currentPage >= totalPages - 1"
            class="reader-nav-btn reader-nav-btn--next"
            @click="nextPage"
          >
            Next
            <ChevronRight :size="12" />
          </button>
        </div>
      </div>

      <!-- Text content -->
      <div class="mx-auto max-w-2xl px-8 py-12">
        <!-- Lesson header -->
        <div class="mb-10">
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
            >Reading</span>
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
          >{{ book.title }}</h2>
          <p
            style="
              font-size: 0.72rem;
              color: #2a2a2a;
              font-family: var(--font-mono);
            "
          >{{ wordCount }} words · click any word to translate</p>
        </div>

        <!-- Reading text -->
        <div style="line-height: 2.1">
          <p style="color: #b0b0b0; font-size: 1rem">
            <template v-for="(token, i) in tokenize(pageText)" :key="i">
              <WordToken
                v-if="isWord(token)"
                :word="token"
                :active="token === selectedWord"
                :status="getWordStatus(token)"
                :saved="isWordSaved(token)"
                @select="selectWord"
              />
              <span v-else>{{ token }}</span>
            </template>
          </p>
        </div>
      </div>
    </main>

    <!-- Word Bank sidebar -->
    <WordBank />

    <!-- Translation bubble -->
    <TranslationBubble
      v-if="selectedWord"
      :word="selectedWord"
      :translation="translation"
      :loading="translating"
      :anchor-rect="anchorRect"
      :saved="isWordSaved(selectedWord)"
      @close="closeBubble"
      @save="onSaveWord"
      @know="onKnowWord"
    />
  </div>
</template>

<style scoped>
.reader-nav-btn {
  display: flex;
  height: 28px;
  align-items: center;
  gap: 6px;
  border-radius: 4px;
  padding: 0 12px;
  font-size: 0.7rem;
  color: #3a3a3a;
  border: 1px solid rgba(255,255,255,0.06);
  background: transparent;
  font-family: var(--font-primary);
  transition: all 0.15s;
}

.reader-nav-btn:disabled {
  opacity: 0.2;
  pointer-events: none;
}

.reader-nav-btn:not(:disabled):hover {
  color: #888888;
  border-color: rgba(255,255,255,0.12);
}

.reader-nav-btn--next {
  color: #e03030;
  border-color: rgba(224,48,48,0.3);
}

.reader-nav-btn--next:not(:disabled):hover {
  color: #e03030;
  background: rgba(224,48,48,0.06);
  border-color: rgba(224,48,48,0.5);
}
</style>
