import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'accueil',
      component: HomeView
    },
    {
      path: '/entreprise',
      name: 'entreprise',
      component: () => import('../views/CompanyView.vue')
    },
    {
      path: '/actifs',
      name: 'actifs',
      component: () => import('../views/AssetsView.vue')
    },
    {
      path: '/vulnerabilites',
      name: 'vulnerabilites',
      component: () => import('../views/VulnerabilitiesView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue')
    },
    {
      path: '/rapport',
      name: 'rapport',
      component: () => import('../views/ReportView.vue')
    }
  ]
})

export default router