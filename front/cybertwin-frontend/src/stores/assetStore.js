import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAppStore } from './appStore'
import { useToastStore } from './toastStore'

export const useAssetStore = defineStore('assets', () => {
  const assets = ref([])
  const appStore = useAppStore()
  const toastStore = useToastStore()
  const API_URL = 'http://localhost:3000/assets'

  const fetchAssets = async () => {
    if (!appStore.currentCompanyId) return; // Sécurité : pas de requête si aucune PME
    try {
      const response = await fetch(`${API_URL}?company_id=${appStore.currentCompanyId}`)
      if (response.ok) {
        assets.value = await response.json()
      }
    } catch (error) { console.error("Erreur GET Assets:", error) }
  }

  const addAsset = async (assetData) => {
    // 1. SÉCURITÉ : Vérifier si l'entreprise est bien sélectionnée
    if (!appStore.currentCompanyId) {
      toastStore.addToast("Vous devez d'abord sélectionner une entreprise dans l'Annuaire !", 'warning')
      return
    }

    try {
      // 2. Formatage strict
      const payload = {
        company_id: appStore.currentCompanyId, 
        name: assetData.name,
        type: assetData.type,
        // Forcer en booléen strict (le backend fera !!is_internet_facing)
        is_internet_facing: assetData.is_internet_facing === true, 
        description: assetData.description || ''
      }

      // 3. LOG DE DÉBOGAGE : Regarde dans ta console (F12) ce qui s'affiche !
      console.log("Payload envoyé à l'API :", payload);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        await fetchAssets()
        toastStore.addToast('Actif ajouté avec succès.', 'success')
      } else {
        const errorData = await response.json()
        console.error("Erreur Backend :", errorData)
        toastStore.addToast(`Le serveur a refusé l'ajout : ${errorData.error || 'Erreur inconnue'}`, 'error')
      }
    } catch (error) {
      console.error("Erreur réseau (POST Assets):", error)
    }
  }

  const removeAsset = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (response.ok) {
        assets.value = assets.value.filter(a => a.id !== id)
        toastStore.addToast('Actif supprimé.', 'success')
      } else {
        toastStore.addToast('Impossible de supprimer l\'actif.', 'error')
      }
    } catch (error) {
      console.error(error)
      toastStore.addToast('Erreur réseau lors de la suppression de l\'actif.', 'error')
    }
  }

  return { assets, fetchAssets, addAsset, removeAsset }
})