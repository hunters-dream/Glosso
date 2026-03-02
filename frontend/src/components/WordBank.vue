<script setup>
import { Trash2, ChevronRight } from 'lucide-vue-next'
import { useWords } from '@/composables/useWords.js'

const { words, removeWord, updateStatus, newCount, learningCount, knownCount } = useWords()

const statusConfig = {
  new: {
    label: 'new',
    dot: 'rgba(255,255,255,0.4)',
    text: 'rgba(255,255,255,0.35)',
    border: 'rgba(255,255,255,0.06)',
  },
  learning: {
    label: 'learning',
    dot: '#e03030',
    text: 'rgba(224,48,48,0.7)',
    border: 'rgba(224,48,48,0.12)',
  },
  known: {
    label: 'known',
    dot: 'rgba(255,255,255,0.18)',
    text: 'rgba(255,255,255,0.18)',
    border: 'rgba(255,255,255,0.04)',
  },
}

const nextStatus = { new: 'learning', learning: 'known', known: 'new' }
</script>

<template>
  <aside
    class="flex-shrink-0 flex flex-col"
    style="
      width: 264px;
      border-left: 1px solid rgba(255,255,255,0.05);
      background: rgba(0,0,0,0.95);
    "
  >
    <!-- Header -->
    <div style="padding: 16px 16px 12px; border-bottom: 1px solid rgba(255,255,255,0.04)">
      <div class="flex items-center justify-between mb-3">
        <span
          style="
            font-family: var(--font-mono);
            font-size: 0.58rem;
            color: #2a2a2a;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          "
        >Word Bank</span>
        <span
          v-if="words.length > 0"
          style="
            font-family: var(--font-mono);
            font-size: 0.62rem;
            color: #333333;
          "
        >{{ words.length }}</span>
      </div>

      <!-- Stats -->
      <div v-if="words.length > 0" class="flex gap-1.5">
        <div
          v-for="(s, i) in [
            { count: newCount, config: statusConfig.new },
            { count: learningCount, config: statusConfig.learning },
            { count: knownCount, config: statusConfig.known },
          ]"
          :key="i"
          class="flex-1 flex items-center gap-1.5 rounded"
          :style="{
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${s.config.border}`,
            padding: '5px 8px',
          }"
        >
          <div
            :style="{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: s.config.dot,
              flexShrink: 0,
            }"
          />
          <span
            :style="{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: s.config.text,
            }"
          >{{ s.count }}</span>
        </div>
      </div>
    </div>

    <!-- Words list -->
    <div class="flex-1 overflow-y-auto wordbank-scroll" style="padding: 8px">
      <!-- Empty state -->
      <div
        v-if="words.length === 0"
        class="flex flex-col items-center justify-center text-center"
        style="padding: 40px 24px"
      >
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
            line-height: 1.8;
            text-align: center;
          "
        >
          click any word<br />to save it here
        </p>
      </div>

      <!-- Word cards -->
      <div v-else class="flex flex-col" style="gap: 1px">
        <div
          v-for="word in words"
          :key="word.id"
          class="group rounded flex items-center justify-between word-card"
          :style="{
            padding: '8px 10px',
            border: `1px solid ${statusConfig[word.status].border}`,
            background: 'rgba(255,255,255,0.01)',
            gap: '8px',
          }"
        >
          <!-- Status dot -->
          <div
            :style="{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: statusConfig[word.status].dot,
              flexShrink: 0,
            }"
          />

          <!-- Word info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-1.5">
              <span
                style="
                  font-size: 0.8rem;
                  color: #c8c8c8;
                  font-weight: 500;
                  font-family: var(--font-display);
                  letter-spacing: -0.01em;
                "
              >{{ word.original }}</span>
            </div>
            <p
              class="truncate"
              style="
                font-size: 0.67rem;
                color: #333333;
                font-family: var(--font-primary);
                margin-top: 1px;
              "
            >{{ word.translation }}</p>
          </div>

          <!-- Status toggle -->
          <button
            class="word-status-btn flex items-center gap-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            :style="{
              fontSize: '0.55rem',
              color: statusConfig[word.status].text,
              fontFamily: 'var(--font-mono)',
              padding: '2px 5px',
              border: `1px solid ${statusConfig[word.status].border}`,
              letterSpacing: '0.05em',
              flexShrink: 0,
            }"
            :title="`→ ${nextStatus[word.status]}`"
            @click="updateStatus(word.id, nextStatus[word.status])"
          >
            {{ statusConfig[word.status].label }}
            <ChevronRight :size="7" />
          </button>

          <!-- Remove -->
          <button
            class="word-remove-btn opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            @click="removeWord(word.id)"
          >
            <Trash2 :size="11" />
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.word-card {
  transition: all 0.15s ease;
}

.word-card:hover {
  background: rgba(255,255,255,0.025) !important;
  border-color: rgba(255,255,255,0.08) !important;
}

.word-remove-btn {
  color: #2a2a2a;
}

.word-remove-btn:hover {
  color: #e03030;
}

/* ── Custom scrollbar ── */
.wordbank-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.06) transparent;
}

.wordbank-scroll::-webkit-scrollbar {
  width: 3px;
}

.wordbank-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.wordbank-scroll::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.06);
  border-radius: 2px;
}

.wordbank-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(224,48,48,0.4);
}
</style>
