import {defineStore} from 'pinia'
import {ref, watch} from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // On lit le localStorage pour voir si l'utilisateur avait déjà choisi le dark mode
  const isDark = ref(localStorage.getItem('theme') === 'dark')

  // Fonction pour basculer le thème
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  // On écoute les changements : si isDark change, on met à jour le HTML et le localStorage
  watch(isDark, (newValue) => {
    if (newValue) {
      document.documentElement.classList.add('dark-theme')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark-theme')
      localStorage.setItem('theme', 'light')
    }
  }, { immediate: true }) // immediate: true applique le thème dès le chargement de la page

  return { isDark, toggleTheme }
})