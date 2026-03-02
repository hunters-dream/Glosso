<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, Info, X } from 'lucide-vue-next'
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
const showInfo = ref(false)
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
const sliderPage = computed({
  get: () => currentPage.value,
  set: (v) => { currentPage.value = Number(v); closeBubble() }
})

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
    <main class="flex-1 flex flex-col overflow-hidden bg-black">

      <!-- Top bar -->
      <div
        class="flex items-center justify-between px-8 shrink-0"
        style="
          height: 56px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          background: rgba(0,0,0,0.92);
          backdrop-filter: blur(12px);
        "
      >
        <div class="flex items-center gap-2">
          <div
            style="
              width: 5px; height: 5px;
              background: #e03030;
              transform: rotate(45deg);
              box-shadow: 0 0 6px rgba(224,48,48,0.4);
            "
          />
          <span
            style="
              font-family: var(--font-display);
              font-size: 0.85rem;
              font-weight: 400;
              letter-spacing: -0.01em;
              color: #d8d8d8;
            "
          >{{ book.title }}</span>
        </div>

        <div class="flex items-center gap-3">
          <span
            style="
              font-family: var(--font-mono);
              font-size: 0.6rem;
              color: #2a2a2a;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            "
          >{{ wordCount }} words · click to translate</span>

          <button
            v-if="book.gutenberg_info"
            class="info-btn"
            :class="{ 'info-btn--active': showInfo }"
            title="Book info"
            @click="showInfo = !showInfo"
          >
            <Info :size="13" />
          </button>
        </div>
      </div>

      <!-- Scroll + side nav wrapper -->
      <div class="flex-1 flex overflow-hidden relative">

        <!-- Left nav zone -->
        <button
          class="side-nav side-nav--left"
          :class="{ 'side-nav--disabled': currentPage <= 0 }"
          :disabled="currentPage <= 0"
          @click="prevPage"
          aria-label="Previous page"
        >
          <ChevronLeft :size="18" />
        </button>

        <!-- Scrollable text area -->
        <div class="flex-1 overflow-y-auto">
          <div class="mx-auto max-w-2xl px-16 py-12">
            <!-- Lesson header -->
            <div class="mb-10">
              <p
                style="
                  font-size: 0.72rem;
                  color: #2a2a2a;
                  font-family: var(--font-mono);
                "
              >Page {{ currentPage + 1 }} / {{ totalPages }}</p>
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
        </div>

        <!-- Right nav zone -->
        <button
          class="side-nav side-nav--right"
          :class="{ 'side-nav--disabled': currentPage >= totalPages - 1 }"
          :disabled="currentPage >= totalPages - 1"
          @click="nextPage"
          aria-label="Next page"
        >
          <ChevronRight :size="18" />
        </button>
      </div>

      <!-- Gutenberg info panel -->
      <Transition name="info-panel">
        <div v-if="showInfo" class="info-panel">
          <div class="info-panel-header">
            <span class="info-panel-title">Book Info</span>
            <button class="info-panel-close" @click="showInfo = false">
              <X :size="13" />
            </button>
          </div>
          <div class="info-panel-body wordbank-scroll">
            <pre class="info-panel-text">{{ book.gutenberg_info }}</pre>
          </div>
        </div>
      </Transition>

      <!-- Bottom slider bar -->
      <div class="slider-bar">
        <span class="slider-label">{{ currentPage + 1 }}</span>

        <div class="slider-track-wrap">
          <input
            v-model="sliderPage"
            type="range"
            min="0"
            :max="totalPages - 1"
            step="1"
            class="page-slider"
          />
          <!-- Progress fill indicator -->
          <div
            class="slider-progress"
            :style="{ width: totalPages > 1 ? (currentPage / (totalPages - 1) * 100) + '%' : '0%' }"
          />
        </div>

        <span class="slider-label">{{ totalPages }}</span>
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
/* ── Side navigation zones ── */
.side-nav {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  flex-shrink: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgba(255,255,255,0.1);
  transition: color 0.2s, background 0.2s;
  z-index: 2;
}

.side-nav::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.side-nav--left::before {
  background: linear-gradient(to right, rgba(224,48,48,0.05), transparent);
}

.side-nav--right::before {
  background: linear-gradient(to left, rgba(224,48,48,0.05), transparent);
}

.side-nav:not(.side-nav--disabled):hover {
  color: rgba(255,255,255,0.35);
}

.side-nav:not(.side-nav--disabled):hover::before {
  opacity: 1;
}

.side-nav:not(.side-nav--disabled):active {
  color: #e03030;
}

.side-nav--disabled {
  opacity: 0.08;
  pointer-events: none;
}

/* ── Bottom slider bar ── */
.slider-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 32px;
  height: 52px;
  flex-shrink: 0;
  border-top: 1px solid rgba(255,255,255,0.04);
  background: rgba(0,0,0,0.92);
  backdrop-filter: blur(12px);
}

.slider-label {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  color: #2a2a2a;
  letter-spacing: 0.08em;
  min-width: 24px;
  text-align: center;
  user-select: none;
}

.slider-track-wrap {
  position: relative;
  flex: 1;
  height: 20px;
  display: flex;
  align-items: center;
}

/* Progress fill behind the thumb */
.slider-progress {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 1px;
  background: #e03030;
  pointer-events: none;
  transition: width 0.15s;
  box-shadow: 0 0 6px rgba(224,48,48,0.5);
}

/* Native range reset + custom styling */
.page-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 20px;
  background: transparent;
  cursor: pointer;
  position: relative;
  z-index: 1;
}

/* Track */
.page-slider::-webkit-slider-runnable-track {
  height: 1px;
  background: rgba(255,255,255,0.06);
  border-radius: 1px;
}
.page-slider::-moz-range-track {
  height: 1px;
  background: rgba(255,255,255,0.06);
  border-radius: 1px;
}

/* Thumb */
.page-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #1a1a1a;
  border: 1.5px solid #e03030;
  box-shadow: 0 0 8px rgba(224,48,48,0.4);
  margin-top: -5.5px;
  transition: transform 0.15s, box-shadow 0.15s;
}
.page-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #1a1a1a;
  border: 1.5px solid #e03030;
  box-shadow: 0 0 8px rgba(224,48,48,0.4);
  transition: transform 0.15s, box-shadow 0.15s;
}

.page-slider:hover::-webkit-slider-thumb {
  transform: scale(1.3);
  box-shadow: 0 0 14px rgba(224,48,48,0.6);
}
.page-slider:hover::-moz-range-thumb {
  transform: scale(1.3);
  box-shadow: 0 0 14px rgba(224,48,48,0.6);
}

.page-slider:focus {
  outline: none;
}
.page-slider:focus::-webkit-slider-thumb {
  transform: scale(1.3);
  box-shadow: 0 0 14px rgba(224,48,48,0.6);
}

/* ── Info button ── */
.info-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  border: 1px solid rgba(255,255,255,0.06);
  background: transparent;
  color: #2a2a2a;
  cursor: pointer;
  transition: all 0.15s;
}

.info-btn:hover {
  color: #888;
  border-color: rgba(255,255,255,0.12);
}

.info-btn--active {
  color: #e03030;
  border-color: rgba(224,48,48,0.3);
  background: rgba(224,48,48,0.06);
}

/* ── Info panel ── */
.info-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 52px; /* above the slider bar */
  width: 380px;
  display: flex;
  flex-direction: column;
  background: rgba(8,8,8,0.97);
  border-left: 1px solid rgba(255,255,255,0.06);
  backdrop-filter: blur(16px);
  z-index: 10;
}

.info-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  flex-shrink: 0;
}

.info-panel-title {
  font-family: var(--font-mono);
  font-size: 0.58rem;
  color: #2a2a2a;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.info-panel-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 3px;
  border: none;
  background: transparent;
  color: #2a2a2a;
  cursor: pointer;
  transition: color 0.15s;
}

.info-panel-close:hover {
  color: #e03030;
}

.info-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.06) transparent;
}

.info-panel-body::-webkit-scrollbar { width: 3px; }
.info-panel-body::-webkit-scrollbar-track { background: transparent; }
.info-panel-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 2px; }
.info-panel-body::-webkit-scrollbar-thumb:hover { background: rgba(224,48,48,0.4); }

.info-panel-text {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: #2a2a2a;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

/* ── Transition ── */
.info-panel-enter-active,
.info-panel-leave-active {
  transition: transform 0.22s ease, opacity 0.22s ease;
}
.info-panel-enter-from,
.info-panel-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
