import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAppStore } from './appStore'

export const useRiskStore = defineStore('risk', () => {
  const dashboardData = ref(null)
  const isLoading = ref(false)

  const fetchDashboard = async () => {
    const appStore = useAppStore() // On récupère l'entreprise active
    
    // Si aucune entreprise n'est sélectionnée, on bloque la requête
    if (!appStore.currentCompanyId) {
      dashboardData.value = null
      return
    }

    isLoading.value = true
    try {
      // C'EST ICI QUE LA LIAISON SE FAIT : on ajoute le company_id à la fin de l'URL
      const url = `http://localhost:3000/dashboard?company_id=${appStore.currentCompanyId}`
      const response = await fetch(url)
      
      if (response.ok) {
        dashboardData.value = await response.json()
      }
    } catch (error) {
      console.error("Erreur GET Dashboard:", error)
    } finally {
      isLoading.value = false
    }
  }

  return { dashboardData, isLoading, fetchDashboard }
})