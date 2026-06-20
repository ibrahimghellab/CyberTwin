import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const currentCompanyId = ref(null)
  
  const setCompany = (id) => {
    currentCompanyId.value = id
  }

  return { currentCompanyId, setCompany }
})