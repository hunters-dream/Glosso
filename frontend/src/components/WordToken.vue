<script setup>
defineProps({
  word: String,
  active: Boolean,
  status: String,
  saved: Boolean,
})
defineEmits(['select'])
</script>

<template>
  <span
    class="word-token cursor-pointer rounded-sm px-0.5 transition-all duration-150"
    :class="{ 'word-token--active': active }"
    :style="{
      borderBottom: saved && status === 'learning'
        ? '1px solid rgba(224,48,48,0.6)'
        : saved && status === 'known'
        ? '1px solid rgba(255,255,255,0.18)'
        : saved
        ? '1px solid rgba(255,255,255,0.4)'
        : 'none',
    }"
    @click="$emit('select', word, $event)"
  >{{ word }}</span>
</template>

<style scoped>
.word-token:hover {
  color: #f0f0f0;
  background: rgba(255,255,255,0.04);
}

.word-token--active {
  color: #f0f0f0;
  background: rgba(255,255,255,0.06);
}
</style>
