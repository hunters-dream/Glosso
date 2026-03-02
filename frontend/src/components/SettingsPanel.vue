<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  Settings, HelpCircle, X, Type, Globe,
  MousePointerClick, BookOpen, MessageSquare, Keyboard,
} from 'lucide-vue-next'
import { useLanguage, LANGUAGES } from '@/composables/useLanguage.js'

const props = defineProps({
  isOpen: Boolean,
  activeTab: { type: String, default: 'settings' },
})
const emit = defineEmits(['close'])

const { targetLang } = useLanguage()

const tab = ref(props.activeTab)
const fontSize = ref(16)
const autoTranslate = ref(true)
const showPronunciation = ref(false)

watch(() => props.activeTab, (v) => { tab.value = v })
watch(() => props.isOpen, (v) => { if (v) tab.value = props.activeTab })

function onKeyDown(e) {
  if (e.key === 'Escape' && props.isOpen) emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))

function onBackdropClick(e) {
  if (e.target === e.currentTarget) emit('close')
}

const shortcuts = [
  { key: 'Esc', action: 'Close popup / modal' },
  { key: 'S', action: 'Open Settings' },
  { key: 'H', action: 'Open Help' },
  { key: '→', action: 'Next page' },
  { key: '←', action: 'Previous page' },
]

const steps = [
  { step: '01', title: 'Click any word', desc: 'Tap a word in the text to see its translation.' },
  { step: '02', title: 'Save to Word Bank', desc: 'Click Save to add the word to your bank on the right.' },
  { step: '03', title: 'Track your progress', desc: 'Words move through New → Learning → Known stages.' },
]

const statuses = [
  { status: 'New', dot: 'rgba(255,255,255,0.4)', desc: 'Just saved' },
  { status: 'Learning', dot: '#e03030', desc: 'In progress' },
  { status: 'Known', dot: 'rgba(255,255,255,0.15)', desc: 'Mastered' },
]
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 flex items-center justify-center z-50"
      style="background: rgba(0,0,0,0.85); backdrop-filter: blur(6px)"
      @click="onBackdropClick"
    >
      <div
        class="w-full max-w-[480px] overflow-hidden"
        style="
          background: rgba(5,5,5,0.98);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          box-shadow: 0 32px 64px rgba(0,0,0,0.9);
        "
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between"
          style="padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05)"
        >
          <div class="flex items-center gap-1">
            <button
              class="settings-tab flex items-center gap-2 rounded transition-all"
              :class="{ active: tab === 'settings' }"
              @click="tab = 'settings'"
            >
              <Settings :size="12" />
              Settings
            </button>
            <button
              class="settings-tab flex items-center gap-2 rounded transition-all"
              :class="{ active: tab === 'help' }"
              @click="tab = 'help'"
            >
              <HelpCircle :size="12" />
              Help
            </button>
          </div>
          <button class="settings-close" @click="emit('close')">
            <X :size="15" />
          </button>
        </div>

        <!-- Content -->
        <div style="padding: 20px; max-height: 65vh; overflow-y: auto">

          <!-- Settings Tab -->
          <div v-if="tab === 'settings'" class="flex flex-col gap-5">
            <!-- Font size -->
            <div>
              <label
                class="flex items-center gap-2 mb-3"
                style="
                  font-size: 0.72rem;
                  color: #3a3a3a;
                  font-family: var(--font-mono);
                  letter-spacing: 0.08em;
                  text-transform: uppercase;
                "
              >
                <Type :size="11" style="color: #333333" />
                Font Size
              </label>
              <div class="flex items-center gap-3">
                <input
                  type="range"
                  :min="12"
                  :max="24"
                  v-model.number="fontSize"
                  style="flex: 1; accent-color: #e03030"
                />
                <span
                  style="
                    font-family: var(--font-mono);
                    font-size: 0.72rem;
                    color: #555555;
                    width: 28px;
                    text-align: right;
                  "
                >{{ fontSize }}</span>
              </div>
            </div>

            <!-- Language -->
            <div>
              <label
                class="flex items-center gap-2 mb-3"
                style="
                  font-size: 0.72rem;
                  color: #3a3a3a;
                  font-family: var(--font-mono);
                  letter-spacing: 0.08em;
                  text-transform: uppercase;
                "
              >
                <Globe :size="11" style="color: #333333" />
                Translation Language
              </label>
              <select
                v-model="targetLang"
                class="settings-select"
              >
                <option
                  v-for="lang in LANGUAGES"
                  :key="lang.code"
                  :value="lang.code"
                  style="background: #0a0a0a"
                >{{ lang.label }}</option>
              </select>
            </div>

            <!-- Toggles -->
            <div class="flex flex-col gap-2">
              <div class="settings-toggle-row">
                <div class="flex items-center gap-2.5">
                  <MousePointerClick :size="11" style="color: #333333" />
                  <span style="font-size: 0.78rem; color: #555555; font-family: var(--font-primary)">
                    Auto-translate on click
                  </span>
                </div>
                <button class="toggle-switch" :class="{ on: autoTranslate }" @click="autoTranslate = !autoTranslate">
                  <div class="toggle-knob" />
                </button>
              </div>
              <div class="settings-toggle-row">
                <div class="flex items-center gap-2.5">
                  <MessageSquare :size="11" style="color: #333333" />
                  <span style="font-size: 0.78rem; color: #555555; font-family: var(--font-primary)">
                    Show pronunciation
                  </span>
                </div>
                <button class="toggle-switch" :class="{ on: showPronunciation }" @click="showPronunciation = !showPronunciation">
                  <div class="toggle-knob" />
                </button>
              </div>
            </div>
          </div>

          <!-- Help Tab -->
          <div v-else class="flex flex-col gap-6">
            <!-- Getting started -->
            <div>
              <p
                class="flex items-center gap-2 mb-4"
                style="
                  font-size: 0.62rem;
                  color: #2a2a2a;
                  font-family: var(--font-mono);
                  letter-spacing: 0.1em;
                  text-transform: uppercase;
                "
              >
                <BookOpen :size="10" />
                Getting Started
              </p>
              <div class="flex flex-col gap-1.5">
                <div
                  v-for="(item, i) in steps"
                  :key="i"
                  class="flex gap-3 rounded"
                  style="
                    padding: 10px 12px;
                    border: 1px solid rgba(255,255,255,0.04);
                    background: rgba(255,255,255,0.01);
                  "
                >
                  <span
                    style="
                      font-family: var(--font-mono);
                      font-size: 0.58rem;
                      color: #e03030;
                      flex-shrink: 0;
                      margin-top: 2px;
                    "
                  >{{ item.step }}</span>
                  <div>
                    <p style="font-size: 0.78rem; color: #888888; font-weight: 500; margin-bottom: 2px">
                      {{ item.title }}
                    </p>
                    <p style="font-size: 0.68rem; color: #333333; font-family: var(--font-primary); line-height: 1.5">
                      {{ item.desc }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Keyboard shortcuts -->
            <div>
              <p
                class="flex items-center gap-2 mb-3"
                style="
                  font-size: 0.62rem;
                  color: #2a2a2a;
                  font-family: var(--font-mono);
                  letter-spacing: 0.1em;
                  text-transform: uppercase;
                "
              >
                <Keyboard :size="10" />
                Keyboard Shortcuts
              </p>
              <div class="flex flex-col gap-0.5">
                <div
                  v-for="(s, i) in shortcuts"
                  :key="i"
                  class="flex items-center justify-between rounded"
                  style="padding: 7px 12px"
                >
                  <span style="font-size: 0.75rem; color: #333333; font-family: var(--font-primary)">
                    {{ s.action }}
                  </span>
                  <kbd class="shortcut-kbd">{{ s.key }}</kbd>
                </div>
              </div>
            </div>

            <!-- Word statuses -->
            <div>
              <p
                style="
                  font-size: 0.62rem;
                  color: #2a2a2a;
                  font-family: var(--font-mono);
                  letter-spacing: 0.1em;
                  text-transform: uppercase;
                  margin-bottom: 12px;
                "
              >Word Statuses</p>
              <div class="flex gap-2">
                <div
                  v-for="(s, i) in statuses"
                  :key="i"
                  class="flex-1 flex flex-col items-center rounded"
                  style="
                    padding: 10px 8px;
                    border: 1px solid rgba(255,255,255,0.04);
                    background: rgba(255,255,255,0.01);
                  "
                >
                  <div
                    :style="{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: s.dot,
                      marginBottom: '6px',
                    }"
                  />
                  <p style="font-size: 0.72rem; color: #888888; font-weight: 500; margin-bottom: 2px">
                    {{ s.status }}
                  </p>
                  <p style="font-size: 0.6rem; color: #2a2a2a; font-family: var(--font-mono)">
                    {{ s.desc }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.settings-tab {
  padding: 6px 12px;
  font-size: 0.75rem;
  font-family: var(--font-primary);
  color: #2a2a2a;
  background: transparent;
  border: 1px solid transparent;
}

.settings-tab.active {
  color: #f0f0f0;
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.06);
}

.settings-close {
  color: #2a2a2a;
  transition: color 0.15s;
  display: flex;
}

.settings-close:hover {
  color: #888888;
}

.settings-select {
  width: 100%;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 4px;
  padding: 8px 12px;
  color: #888888;
  font-size: 0.78rem;
  font-family: var(--font-primary);
  outline: none;
  cursor: pointer;
}

.settings-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid rgba(255,255,255,0.05);
  background: rgba(255,255,255,0.01);
  border-radius: 4px;
}

.toggle-switch {
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.08);
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
  cursor: pointer;
}

.toggle-switch.on {
  background: rgba(224,48,48,0.8);
  border-color: rgba(224,48,48,0.5);
}

.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ffffff;
  transition: left 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}

.toggle-switch.on .toggle-knob {
  left: 18px;
}

.shortcut-kbd {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: #555555;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 3px;
  padding: 2px 7px;
}
</style>
