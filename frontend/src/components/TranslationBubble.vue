<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { Volume2 } from 'lucide-vue-next'

const props = defineProps({
  word: String,
  translation: String,
  loading: Boolean,
  anchorRect: Object,
  saved: Boolean,
})
const emit = defineEmits(['close', 'save', 'know'])

const bubble = ref(null)
const pos = ref({ top: 0, left: 0 })

function reposition() {
  if (!props.anchorRect || !bubble.value) return
  const el = bubble.value
  const r = props.anchorRect
  const bw = el.offsetWidth
  const bh = el.offsetHeight

  let left = r.left + r.width / 2 - bw / 2
  let top = r.top - bh - 10

  if (left < 8) left = 8
  if (left + bw > window.innerWidth - 8) left = window.innerWidth - bw - 8
  if (top < 8) top = r.top + r.height + 10

  pos.value = { top, left }
}

watch(() => props.anchorRect, async () => {
  await nextTick()
  reposition()
}, { immediate: true })

onMounted(() => {
  nextTick(reposition)
  window.addEventListener('resize', reposition)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', reposition)
})

function onClickOutside(e) {
  if (bubble.value && !bubble.value.contains(e.target) && !e.target.closest('.word-token')) {
    emit('close')
  }
}
onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <div
    ref="bubble"
    class="fixed z-50 rounded-xl border border-border bg-popover shadow-2xl shadow-black/40 p-3 min-w-[200px] max-w-[300px] transition-opacity duration-150"
    :style="{ top: pos.top + 'px', left: pos.left + 'px' }"
  >
    <!-- Arrow -->
    <div
      v-if="pos.top < (anchorRect?.top ?? 0)"
      class="absolute left-1/2 -translate-x-1/2"
      style="bottom: -6px; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid var(--popover);"
    />
    <div
      v-else
      class="absolute left-1/2 -translate-x-1/2"
      style="top: -6px; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 6px solid var(--popover);"
    />

    <!-- Word + pronunciation -->
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <span class="text-[0.95rem] font-semibold text-foreground">{{ word }}</span>
          <button class="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
            <Volume2 class="size-3" />
          </button>
        </div>
        <div v-if="loading" class="mt-0.5 text-[0.85rem] text-muted-foreground animate-pulse">Translating…</div>
        <p v-else-if="translation" class="mt-0.5 text-[0.85rem] text-primary">{{ translation }}</p>
        <p v-else class="mt-0.5 text-[0.85rem] text-muted-foreground italic">No translation found.</p>
      </div>
      <button
        @click="emit('close')"
        class="text-[0.8rem] text-muted-foreground hover:text-foreground transition-colors"
      >&times;</button>
    </div>

    <!-- Action buttons -->
    <div v-if="translation && !loading" class="mt-2.5 flex gap-1.5">
      <button
        @click="emit('save')"
        class="flex-1 rounded-lg bg-primary px-3 py-1.5 text-[0.75rem] font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        {{ saved ? 'Update' : 'Save Word' }}
      </button>
      <button
        @click="emit('know')"
        class="rounded-lg border border-[var(--word-known)]/30 px-3 py-1.5 text-[0.75rem] font-medium text-[var(--word-known)] transition-colors hover:bg-[var(--word-known)]/10"
      >
        I Know This
      </button>
    </div>
  </div>
</template>
