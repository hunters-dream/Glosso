import { ref, computed } from 'vue'

const words = ref([])
let nextId = 1

export function useWords() {
  function addWord(original, translation, status = 'new') {
    const existing = words.value.find(
      w => w.original.toLowerCase() === original.toLowerCase()
    )
    if (existing) {
      existing.translation = translation
      existing.status = status
      return existing
    }
    const word = { id: nextId++, original, translation, status }
    words.value.push(word)
    return word
  }

  function removeWord(id) {
    words.value = words.value.filter(w => w.id !== id)
  }

  const statusCycle = { new: 'learning', learning: 'known', known: 'new' }

  function updateStatus(id, status) {
    const word = words.value.find(w => w.id === id)
    if (word) word.status = status ?? statusCycle[word.status]
  }

  function isWordSaved(original) {
    return words.value.some(
      w => w.original.toLowerCase() === original.toLowerCase()
    )
  }

  function getWordStatus(original) {
    const word = words.value.find(
      w => w.original.toLowerCase() === original.toLowerCase()
    )
    return word?.status ?? null
  }

  const newCount = computed(() => words.value.filter(w => w.status === 'new').length)
  const learningCount = computed(() => words.value.filter(w => w.status === 'learning').length)
  const knownCount = computed(() => words.value.filter(w => w.status === 'known').length)

  return {
    words,
    addWord,
    removeWord,
    updateStatus,
    isWordSaved,
    getWordStatus,
    newCount,
    learningCount,
    knownCount,
  }
}
