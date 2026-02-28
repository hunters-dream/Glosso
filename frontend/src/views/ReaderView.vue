<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import WordToken from '@/components/WordToken.vue'
import TranslationBubble from '@/components/TranslationBubble.vue'
import WordBank from '@/components/WordBank.vue'
import { translateWord } from '@/lib/api.js'
import { useBook } from '@/composables/useBook.js'
import { useLanguage } from '@/composables/useLanguage.js'
import { useWords } from '@/composables/useWords.js'

const router = useRouter()
const { book } = useBook()
const { targetLang } = useLanguage()
const { addWord, isWordSaved, getWordStatus } = useWords()

const currentPage = ref(0)
const selectedWord = ref(null)
const translation = ref(null)
const translating = ref(false)
const anchorRect = ref(null)

onMounted(() => {
  if (!book.value) router.replace('/library')
})

const pageText = computed(() => book.value?.pages[currentPage.value] ?? '')
const totalPages = computed(() => book.value?.pages.length ?? 0)

function tokenize(text) {
  return text.split(/([A-Za-zÄÖÜäöüß]+)/).filter(t => t !== '')
}
function isWord(token) {
  return /^[A-Za-zÄÖÜäöüß]+$/.test(token)
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
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Title bar -->
      <div class="border-b border-border px-8 py-3 flex items-center justify-center shrink-0">
        <span class="font-medium">{{ book.title }}</span>
        <span class="ml-3 text-sm text-muted-foreground tabular-nums">
          {{ currentPage + 1 }} / {{ totalPages }}
        </span>
      </div>

      <!-- Text area with side pagination -->
      <div class="flex-1 flex items-stretch overflow-hidden">
        <!-- Left page button -->
        <button
          class="w-12 shrink-0 flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-20 disabled:pointer-events-none"
          :disabled="currentPage === 0"
          @click="prevPage"
        >
          <ChevronLeft class="size-5" />
        </button>

        <!-- Reading content -->
        <div class="flex-1 overflow-y-auto px-6 py-10">
          <p class="max-w-3xl mx-auto leading-loose" style="font-size: 1.05rem; line-height: 2;">
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

        <!-- Right page button -->
        <button
          class="w-12 shrink-0 flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-20 disabled:pointer-events-none"
          :disabled="currentPage === totalPages - 1"
          @click="nextPage"
        >
          <ChevronRight class="size-5" />
        </button>
      </div>
    </div>

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
