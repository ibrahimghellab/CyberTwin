<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useAppStore } from './stores/appStore'

const appStore = useAppStore()
</script>

<template>
  <div class="app-wrapper">
    <aside class="sidebar">
      <div class="logo">CyberTwin</div>
      <nav>
        <RouterLink to="/">Accueil</RouterLink>
        <RouterLink to="/entreprise">Entreprises</RouterLink>
        
        <template v-if="appStore.currentCompanyId">
          <RouterLink to="/actifs">Actifs</RouterLink>
          <RouterLink to="/vulnerabilites">Vulnérabilités</RouterLink>
          <RouterLink to="/dashboard">Tableau de bord</RouterLink>
          <RouterLink to="/rapport">Rapport</RouterLink>
        </template>
        <div v-else class="nav-warning">Sélectionnez une entreprise pour débloquer les outils.</div>
      </nav>
    </aside>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
/* CSS épuré */
body { margin: 0; font-family: 'Inter', sans-serif; background-color: #f4f7f6; color: #333; }
.app-wrapper { display: flex; min-height: 100vh; }
.sidebar { width: 250px; background: #ffffff; padding: 2rem 1rem; box-shadow: 2px 0 10px rgba(0,0,0,0.03); z-index: 10; }
.logo { font-size: 1.5rem; font-weight: bold; color: #2c3e50; margin-bottom: 2rem; text-align: center; }
nav { display: flex; flex-direction: column; gap: 0.5rem; }
nav a { padding: 0.8rem 1rem; text-decoration: none; color: #555; border-radius: 8px; transition: all 0.3s ease; }
nav a:hover { background: #f0f4f8; transform: translateX(5px); }
nav a.router-link-exact-active { background: #2c3e50; color: white; box-shadow: 0 4px 6px rgba(44, 62, 80, 0.2); }
.nav-warning { font-size: 0.8rem; color: #d32f2f; padding: 1rem; text-align: center; font-style: italic; }
.main-content { flex: 1; padding: 2rem 3rem; overflow-y: auto; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from { opacity: 0; transform: translateY(10px); }
.fade-leave-to { opacity: 0; transform: translateY(-10px); }

@media print {
  /* On cache la barre latérale */
  .sidebar { 
    display: none !important; 
  }
  
  /* On enlève les marges du contenu principal pour utiliser toute la page A4 */
  .main-content { 
    padding: 0 !important; 
    overflow: visible !important; 
  }
  
  /* On désactive le flexbox global pour éviter les bugs de saut de page */
  .app-wrapper { 
    display: block !important; 
  }
}

</style>