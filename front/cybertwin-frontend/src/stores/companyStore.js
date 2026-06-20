import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'

export const useCompanyStore = defineStore('company', () => {
  // État (State) : les données de l'entreprise [cite: 28-31]
  const companyInfo = ref({
    name: '',
    sector: '',
    employeesCount: 0,
    serversCount: 0,
    clientsCount: 0,
    exposedServices: 0
  })

  // Actions : fonctions pour modifier l'état ou appeler l'API
  const fetchCompany = async () => {
    try {
      const data = await api.getCompany()
      companyInfo.value = data
    } catch (error) {
      console.error("Erreur lors de la récupération de l'entreprise:", error)
    }
  }

  const updateCompany = async (newData) => {
    // Ici, on simulera plus tard l'envoi au backend
    companyInfo.value = { ...companyInfo.value, ...newData }
  }

  return { companyInfo, fetchCompany, updateCompany }
})