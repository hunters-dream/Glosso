<script setup>
defineProps({
  word: String,
  active: Boolean,
  status: String,   // 'new' | 'learning' | 'known' | null
  saved: Boolean,
})
defineEmits(['select'])
</script>

<template>
  <span
    class="word-token cursor-pointer rounded-sm px-0.5 transition-all duration-150 hover:bg-[var(--word-hover)]"
    :class="[
      active && 'bg-primary/15 text-primary',
      saved && status === 'known' && 'bg-[var(--word-known)]/15 border-b-2 border-[var(--word-known)]',
      saved && status === 'learning' && 'bg-[var(--word-learning)]/15 border-b-2 border-[var(--word-learning)]',
    ]"
    style="font-size: 1.05rem"
    @click="$emit('select', word, $event)"
  >{{ word }}</span>
</template>
