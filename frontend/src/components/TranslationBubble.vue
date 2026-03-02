<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { Volume2, X, Plus, Check } from 'lucide-vue-next'

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
  document.addEventListener('mousedown', onClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', reposition)
  document.removeEventListener('mousedown', onClickOutside)
})

function onClickOutside(e) {
  if (bubble.value && !bubble.value.contains(e.target) && !e.target.closest('.word-token')) {
    emit('close')
  }
}
</script>

<template>
  <div
    ref="bubble"
    class="fixed z-50"
    :style="{ top: pos.top + 'px', left: pos.left + 'px' }"
    style="animation: popupFadeIn 0.12s ease"
  >
    <div
      style="
        min-width: 196px;
        background: rgba(6, 6, 6, 0.97);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 6px;
        padding: 12px 14px;
        box-shadow: 0 16px 40px rgba(0,0,0,0.8);
        backdrop-filter: blur(20px);
      "
    >
      <!-- Word + close -->
      <div class="flex items-start justify-between gap-3 mb-2">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span
              style="
                font-family: var(--font-display);
                font-size: 1rem;
                font-weight: 500;
                color: #f0f0f0;
                letter-spacing: -0.01em;
              "
            >{{ word }}</span>
            <button class="bubble-icon-btn flex">
              <Volume2 :size="11" />
            </button>
          </div>
          <div v-if="loading" class="animate-pulse" style="font-size: 0.82rem; color: #666666; font-family: var(--font-primary)">
            Translating...
          </div>
          <p v-else-if="translation" style="font-size: 0.82rem; color: #666666; font-family: var(--font-primary)">
            {{ translation }}
          </p>
          <p v-else style="font-size: 0.82rem; color: #333333; font-family: var(--font-primary); font-style: italic">
            No translation found.
          </p>
        </div>
        <button class="bubble-icon-btn" style="margin-top: 2px" @click="emit('close')">
          <X :size="13" />
        </button>
      </div>

      <!-- Divider -->
      <div style="height: 1px; background: rgba(255,255,255,0.05); margin: 10px 0" />

      <!-- Actions -->
      <div v-if="translation && !loading" class="flex gap-2">
        <button class="bubble-action-btn flex-1" @click="emit('save')">
          <Plus :size="10" />
          {{ saved ? 'Update' : 'Save' }}
        </button>
        <button class="bubble-action-btn bubble-action-btn--secondary" @click="emit('know')">
          <Check :size="10" />
          Know it
        </button>
      </div>
    </div>

    <!-- Downward arrow -->
    <div
      style="
        position: absolute;
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid rgba(255,255,255,0.1);
      "
    />
    <div
      style="
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 4px solid rgb(6,6,6);
      "
    />
  </div>
</template>

<style scoped>
.bubble-icon-btn {
  color: #2a2a2a;
  transition: color 0.15s;
}

.bubble-icon-btn:hover {
  color: #888888;
}

.bubble-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 4px;
  font-size: 0.68rem;
  color: #c0c0c0;
  border: 1px solid rgba(255,255,255,0.1);
  background: transparent;
  padding: 6px 10px;
  font-family: var(--font-primary);
  letter-spacing: 0.04em;
  transition: all 0.15s;
}

.bubble-action-btn:hover {
  border-color: rgba(255,255,255,0.2);
  color: #f0f0f0;
}

.bubble-action-btn--secondary {
  color: #333333;
  border-color: rgba(255,255,255,0.05);
}

.bubble-action-btn--secondary:hover {
  color: #888888;
  border-color: rgba(255,255,255,0.1);
}
</style>
