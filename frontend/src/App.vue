<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BarChart2, Settings, HelpCircle, PanelLeftClose, PanelLeftOpen } from 'lucide-vue-next'
import { useLanguage } from '@/composables/useLanguage.js'
import { useWords } from '@/composables/useWords.js'
import { useSidebar } from '@/composables/useSidebar.js'
import { useSettings } from '@/composables/useSettings.js'
import SettingsPanel from '@/components/SettingsPanel.vue'

const route = useRoute()
const router = useRouter()
const { targetLang } = useLanguage()
const { words, newCount, learningCount, knownCount } = useWords()
const { collapsed, toggle } = useSidebar()
const { settingsOpen, settingsTab, openSettings, closeSettings } = useSettings()

const showSidebar = computed(() => route.path !== '/')
const totalWords = computed(() => words.value.length)
const knownPercent = computed(() =>
  totalWords.value > 0 ? Math.round((knownCount.value / totalWords.value) * 100) : 0
)
</script>

<template>
  <!-- Landing page: no sidebar, full screen -->
  <div v-if="!showSidebar" class="h-screen bg-black">
    <RouterView />
  </div>

  <!-- App layout: sidebar + main -->
  <div v-else class="flex h-screen overflow-hidden bg-black text-foreground">
    <!-- Left Sidebar -->
    <aside
      class="flex flex-col shrink-0 transition-all duration-300"
      :style="{
        width: collapsed ? '56px' : '220px',
        background: 'rgba(0,0,0,0.98)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }"
    >
      <!-- Logo -->
      <div
        class="flex items-center gap-2.5 px-4"
        style="height: 56px; border-bottom: 1px solid rgba(255,255,255,0.05)"
      >
        <button
          class="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          @click="router.push('/')"
        >
          <div
            style="
              width: 8px;
              height: 8px;
              background: #e03030;
              transform: rotate(45deg);
              flex-shrink: 0;
              box-shadow: 0 0 8px rgba(224,48,48,0.5);
            "
          />
          <span
            v-if="!collapsed"
            style="
              font-family: var(--font-display);
              font-size: 1.05rem;
              font-weight: 300;
              letter-spacing: -0.03em;
              color: #d0d0d0;
            "
          >glosso</span>
        </button>
      </div>

      <!-- Navigation -->
      <div class="flex-1 overflow-y-auto py-3">
        <p
          v-if="!collapsed"
          style="
            font-size: 0.58rem;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #2a2a2a;
            padding: 0 16px;
            margin-bottom: 8px;
            font-family: var(--font-mono);
          "
        >Navigation</p>

        <RouterLink
          to="/library"
          v-slot="{ isActive }"
          custom
        >
          <button
            class="flex w-full items-center gap-3 px-4 py-2.5 transition-all duration-150"
            :style="{
              background: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
              borderLeft: isActive ? '1px solid rgba(224,48,48,0.7)' : '1px solid transparent',
            }"
            @click="router.push('/library')"
          >
            <span
              style="
                font-family: var(--font-mono);
                font-size: 0.62rem;
                flex-shrink: 0;
                width: 16px;
                text-align: right;
              "
              :style="{ color: isActive ? '#e03030' : '#2a2a2a' }"
            >01</span>
            <span
              v-if="!collapsed"
              class="truncate"
              style="font-size: 0.75rem"
              :style="{
                color: isActive ? '#e8e8e8' : '#4a4a4a',
                fontWeight: isActive ? 500 : 400,
              }"
            >Library</span>
          </button>
        </RouterLink>

        <RouterLink
          to="/reader"
          v-slot="{ isActive }"
          custom
        >
          <button
            class="flex w-full items-center gap-3 px-4 py-2.5 transition-all duration-150"
            :style="{
              background: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
              borderLeft: isActive ? '1px solid rgba(224,48,48,0.7)' : '1px solid transparent',
            }"
            @click="router.push('/reader')"
          >
            <span
              style="
                font-family: var(--font-mono);
                font-size: 0.62rem;
                flex-shrink: 0;
                width: 16px;
                text-align: right;
              "
              :style="{ color: isActive ? '#e03030' : '#2a2a2a' }"
            >02</span>
            <span
              v-if="!collapsed"
              class="truncate"
              style="font-size: 0.75rem"
              :style="{
                color: isActive ? '#e8e8e8' : '#4a4a4a',
                fontWeight: isActive ? 500 : 400,
              }"
            >Reader</span>
          </button>
        </RouterLink>
      </div>

      <!-- Progress -->
      <div
        v-if="!collapsed && totalWords > 0"
        style="padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.04)"
      >
        <div class="flex items-center gap-1.5 mb-2">
          <BarChart2 :size="11" style="color: #333333" />
          <span
            style="
              font-size: 0.6rem;
              color: #2a2a2a;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              font-family: var(--font-mono);
            "
          >Progress</span>
        </div>
        <div
          style="
            height: 1px;
            background: rgba(255,255,255,0.06);
            border-radius: 1px;
            overflow: hidden;
          "
        >
          <div
            style="height: 100%; background: #e03030; transition: width 0.5s ease; box-shadow: 0 0 6px rgba(224,48,48,0.4)"
            :style="{ width: knownPercent + '%' }"
          />
        </div>
        <p
          style="
            margin-top: 6px;
            font-size: 0.58rem;
            color: #1e1e1e;
            font-family: var(--font-mono);
          "
        >{{ knownCount }} known · {{ learningCount }} learning · {{ totalWords }} total</p>
      </div>

      <!-- Bottom actions -->
      <div
        class="flex items-center gap-1 p-2"
        style="border-top: 1px solid rgba(255,255,255,0.04)"
      >
        <button
          class="sidebar-icon-btn flex h-8 w-8 items-center justify-center rounded transition-colors"
          @click="toggle"
        >
          <PanelLeftOpen v-if="collapsed" :size="14" />
          <PanelLeftClose v-else :size="14" />
        </button>
        <template v-if="!collapsed">
          <button
            class="sidebar-icon-btn flex h-8 w-8 items-center justify-center rounded transition-colors"
            title="Settings (S)"
            @click="openSettings('settings')"
          >
            <Settings :size="13" />
          </button>
          <button
            class="sidebar-icon-btn flex h-8 w-8 items-center justify-center rounded transition-colors"
            title="Help (H)"
            @click="openSettings('help')"
          >
            <HelpCircle :size="13" />
          </button>
        </template>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden bg-black">
      <RouterView />
    </div>

    <!-- Settings Modal -->
    <SettingsPanel
      :is-open="settingsOpen"
      :active-tab="settingsTab"
      @close="closeSettings"
    />
  </div>
</template>

<style scoped>
.sidebar-icon-btn {
  color: #2a2a2a;
}
.sidebar-icon-btn:hover {
  color: #888888;
}
</style>
