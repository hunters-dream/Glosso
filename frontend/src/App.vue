<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { BookOpen, Home, Library, PanelLeftClose, PanelLeft, Settings, HelpCircle } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import LanguageSelector from '@/components/LanguageSelector.vue'
import { useLanguage } from '@/composables/useLanguage.js'
import { useWords } from '@/composables/useWords.js'

const { locale } = useI18n()
const { targetLang } = useLanguage()
const { newCount, learningCount, knownCount } = useWords()

watch(targetLang, (v) => { locale.value = v.toLowerCase() }, { immediate: true })

const collapsed = ref(false)
</script>

<template>
  <div class="min-h-screen bg-background flex">
    <!-- Left Sidebar -->
    <aside
      :class="[
        'bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 transition-all duration-200',
        collapsed ? 'w-16' : 'w-56'
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center gap-2.5 px-4 py-4 border-b border-sidebar-border">
        <BookOpen class="size-5 text-primary shrink-0" />
        <span v-if="!collapsed" class="text-base font-semibold tracking-tight text-foreground">Glosso</span>
        <Badge v-if="!collapsed" variant="secondary" class="ml-0 text-[0.6rem]">Alpha</Badge>
      </div>

      <!-- Navigation -->
      <nav class="flex flex-col gap-1 px-2 py-3">
        <RouterLink
          to="/"
          :class="[
            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
            'text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-foreground'
          ]"
        >
          <Home class="size-4 shrink-0" />
          <span v-if="!collapsed">Home</span>
        </RouterLink>
        <RouterLink
          to="/library"
          :class="[
            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
            'text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-foreground'
          ]"
        >
          <Library class="size-4 shrink-0" />
          <span v-if="!collapsed">Library</span>
        </RouterLink>
      </nav>

      <!-- Language Selector -->
      <div v-if="!collapsed" class="px-4 py-2">
        <p class="text-[0.65rem] uppercase tracking-wider text-muted-foreground mb-2">Translate to</p>
        <LanguageSelector />
      </div>

      <!-- Progress -->
      <div v-if="!collapsed" class="px-4 py-3 mt-auto border-t border-sidebar-border">
        <p class="text-[0.65rem] uppercase tracking-wider text-muted-foreground mb-2">Word Progress</p>
        <div class="flex gap-2 text-center">
          <div class="flex-1">
            <div class="text-sm font-semibold text-[var(--word-new)]">{{ newCount }}</div>
            <div class="text-[0.55rem] text-muted-foreground">New</div>
          </div>
          <div class="flex-1">
            <div class="text-sm font-semibold text-[var(--word-learning)]">{{ learningCount }}</div>
            <div class="text-[0.55rem] text-muted-foreground">Learning</div>
          </div>
          <div class="flex-1">
            <div class="text-sm font-semibold text-[var(--word-known)]">{{ knownCount }}</div>
            <div class="text-[0.55rem] text-muted-foreground">Known</div>
          </div>
        </div>
      </div>

      <!-- Bottom actions -->
      <div class="px-2 py-2 border-t border-sidebar-border flex items-center" :class="collapsed ? 'flex-col gap-1' : 'gap-1'">
        <button
          v-if="!collapsed"
          class="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
        >
          <Settings class="size-3.5" />
          <span>Settings</span>
        </button>
        <button
          v-if="!collapsed"
          class="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
        >
          <HelpCircle class="size-3.5" />
          <span>Help</span>
        </button>
        <button
          class="rounded-lg p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
          :class="collapsed ? '' : 'ml-auto'"
          @click="collapsed = !collapsed"
          :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <PanelLeft v-if="collapsed" class="size-4" />
          <PanelLeftClose v-else class="size-4" />
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <RouterView />
    </div>
  </div>
</template>
