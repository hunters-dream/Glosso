import { ref } from 'vue'

const settingsOpen = ref(false)
const settingsTab = ref('settings')

export function useSettings() {
  function openSettings(tab = 'settings') {
    settingsTab.value = tab
    settingsOpen.value = true
  }

  function closeSettings() {
    settingsOpen.value = false
  }

  return { settingsOpen, settingsTab, openSettings, closeSettings }
}
