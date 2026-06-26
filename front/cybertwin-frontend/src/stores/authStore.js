import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToastStore } from './toastStore'
import { useAppStore } from './appStore' // 👈 Import du store de l'application

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  
  const router = useRouter()
  const toastStore = useToastStore()
  const appStore = useAppStore() // 👈 Initialisation

  // SÉCURITÉ ANTI-RAFRAÎCHISSEMENT (F5)
  // Si un utilisateur standard actualise la page, on lui redonne instantanément son entreprise
  if (user.value && user.value.role === 'user' && user.value.company_id) {
    appStore.setCompany(user.value.company_id)
  }

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        token.value = data.token
        user.value = data.user
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        toastStore.addToast('Connexion réussie !', 'success')
        
        // AIGUILLAGE MULTI-TENANT :
        if (data.user.role === 'admin') {
          router.push('/entreprise') // L'admin va sur l'annuaire global
        } else {
          appStore.setCompany(data.user.company_id) // On assigne son entreprise en cache
          router.push('/actifs') // Il va directement sur SON parc
        }

      } else {
        toastStore.addToast(data.error || 'Identifiants incorrects', 'error')
      }
    } catch (error) {
      console.error(error)
      toastStore.addToast('Impossible de joindre le serveur.', 'error')
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    appStore.setCompany(null) // On purge l'entreprise en cache
    router.push('/login')
  }

  return { token, user, login, logout }
})