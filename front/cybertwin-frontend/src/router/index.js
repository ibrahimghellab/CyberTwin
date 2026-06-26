import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/entreprise' // 👈 Redirection immédiate vers le cœur de l'app
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/entreprise',
      name: 'entreprise',
      component: () => import('../views/CompanyView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/actifs',
      name: 'actifs',
      component: () => import('../views/AssetsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/vulnerabilites',
      name: 'vulnerabilites',
      component: () => import('../views/VulnerabilitiesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/rapport',
      name: 'rapport',
      component: () => import('../views/ReportView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/utilisateurs',
      name: 'utilisateurs',
      component: () => import('../views/UsersView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Le "Videur" : s'exécute automatiquement avant chaque changement de page
router.beforeEach((to, from) => {
  const authStore = useAuthStore()
  
  // 1. L'utilisateur n'est pas connecté
  if (to.meta.requiresAuth && !authStore.token) {
    return '/login'
  } 
  // 2. L'utilisateur standard essaie d'accéder aux entreprises ou aux comptes
  else if ((to.path === '/entreprise' || to.path === '/utilisateurs') && authStore.user?.role !== 'admin') {
    return '/actifs' // On le renvoie de force dans son espace
  }
  // 3. L'utilisateur connecté essaie de retourner à l'accueil/login public
  else if ((to.path === '/login' || to.path === '/') && authStore.token) {
    // Redirection intelligente selon le rôle
    if (authStore.user?.role === 'admin') {
      return '/entreprise'
    } else {
      return '/actifs'
    }
  } 
  // 4. Tout est ok, on le laisse passer
  return true
})

export default router