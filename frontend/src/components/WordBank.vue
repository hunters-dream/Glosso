<script setup>
import { BookOpen, Trash2, ChevronRight } from 'lucide-vue-next'
import { useWords } from '@/composables/useWords.js'

const { words, removeWord, updateStatus, newCount, learningCount, knownCount } = useWords()

const statusConfig = {
  new: { label: 'New', bgClass: 'bg-[var(--word-new)]/10', textClass: 'text-[var(--word-new)]', borderClass: 'border-[var(--word-new)]/20' },
  learning: { label: 'Learning', bgClass: 'bg-[var(--word-learning)]/10', textClass: 'text-[var(--word-learning)]', borderClass: 'border-[var(--word-learning)]/20' },
  known: { label: 'Known', bgClass: 'bg-[var(--word-known)]/10', textClass: 'text-[var(--word-known)]', borderClass: 'border-[var(--word-known)]/20' },
}

const nextStatus = { new: 'learning', learning: 'known', known: 'new' }
</script>

<template>
  <aside class="w-72 border-l border-border bg-sidebar flex flex-col h-full shrink-0">
    <!-- Header -->
    <div class="flex items-center gap-2 px-4 pt-4 pb-3">
      <BookOpen class="size-4 text-primary" />
      <h3 class="text-[0.9rem] text-foreground">Word Bank</h3>
      <span class="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[0.7rem] font-medium text-primary">
        {{ words.length }}
      </span>
    </div>

    <!-- Stats bar -->
    <div v-if="words.length > 0" class="mx-4 mb-3 flex gap-2">
      <div
        v-for="s in [
          { count: newCount, label: 'New', ...statusConfig.new },
          { count: learningCount, label: 'Learning', ...statusConfig.learning },
          { count: knownCount, label: 'Known', ...statusConfig.known },
        ]"
        :key="s.label"
        :class="['flex-1 rounded-lg px-2 py-1.5 text-center', s.bgClass]"
      >
        <div :class="s.textClass" class="text-[0.95rem] font-semibold">{{ s.count }}</div>
        <div class="text-[0.6rem] text-muted-foreground">{{ s.label }}</div>
      </div>
    </div>

    <!-- Words list -->
    <div class="flex-1 overflow-y-auto px-3 pb-3">
      <!-- Empty state -->
      <div v-if="words.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
        <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
          <BookOpen class="size-5 text-muted-foreground" />
        </div>
        <p class="text-[0.8rem] text-muted-foreground">Click any word in the text to save it here</p>
      </div>

      <!-- Word cards -->
      <div v-else class="space-y-1.5">
        <div
          v-for="word in words"
          :key="word.id"
          :class="['group rounded-lg border bg-card p-2.5 transition-all hover:bg-secondary', statusConfig[word.status].borderClass]"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-[0.85rem] font-medium text-foreground truncate">{{ word.original }}</span>
                <button
                  :class="['flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[0.6rem] font-medium transition-colors hover:opacity-80', statusConfig[word.status].bgClass, statusConfig[word.status].textClass]"
                  :title="`Click to change to ${nextStatus[word.status]}`"
                  @click="updateStatus(word.id, nextStatus[word.status])"
                >
                  {{ statusConfig[word.status].label }}
                  <ChevronRight class="size-2" />
                </button>
              </div>
              <p class="mt-0.5 text-[0.75rem] text-muted-foreground truncate">{{ word.translation }}</p>
            </div>
            <button
              class="mt-0.5 flex-shrink-0 text-muted-foreground opacity-0 transition-all hover:text-destructive group-hover:opacity-100"
              @click="removeWord(word.id)"
            >
              <Trash2 class="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
