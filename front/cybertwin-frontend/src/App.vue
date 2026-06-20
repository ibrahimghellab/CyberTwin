<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useAppStore } from './stores/appStore'
import { useThemeStore } from './stores/themeStore'
import ToastContainer from './components/ToastContainer.vue'

const appStore = useAppStore()
const themeStore = useThemeStore()
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
        <div v-else class="nav-warning">Sélectionnez une entreprise.</div>
      </nav>

      <div class="theme-toggle" @click="themeStore.toggleTheme">
        {{ themeStore.isDark ? '☀️ Mode Clair' : '🌙 Mode Sombre' }}
      </div>
    </aside>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <ToastContainer />
  </div>
</template>

<style>
/* 1. PALETTE COMPLÉMENTAIRE (Variables CSS) */
:root {
  --bg-color: #f4f7f6;
  --sidebar-bg: #ffffff;
  --surface: #ffffff;
  --surface-alt: #f7fafc;
  --card-bg: #ffffff;
  --text-color: #1a252f;
  --text-muted: #6b7280;
  --text-secondary: #475569;
  --primary-color: #2980b9;    /* Bleu Technique */
  --primary-hover: #1f618d;
  --accent-color: #e67e22;    /* Orange Alerte */
  --accent-hover: #d35400;
  --danger-color: #d32f2f;
  --warning-color: #ff9800;
  --success-color: #4caf50;
  --border-color: #dcdde1;
  --shadow-color: rgba(0,0,0,0.08);
  --shadow-color-soft: rgba(0,0,0,0.04);
}

html.dark-theme {
  --bg-color: #101214;
  --sidebar-bg: #16181c;
  --surface: #1f252c;
  --surface-alt: #222b35;
  --card-bg: #1f252c;
  --text-color: #f3f6fb;
  --text-muted: #a0aec0;
  --text-secondary: #cbd5e1;
  --primary-color: #4aa3f0;
  --primary-hover: #3588d4;
  --accent-color: #f39c12;
  --accent-hover: #d68910;
  --danger-color: #f87171;
  --warning-color: #fbbf24;
  --success-color: #34d399;
  --border-color: #2f3842;
  --shadow-color: rgba(0,0,0,0.24);
  --shadow-color-soft: rgba(0,0,0,0.12);
}

/* 2. LAYOUT FIXE */
body { margin: 0; font-family: 'Inter', sans-serif; }

.app-wrapper { 
  display: flex; 
  height: 100vh; 
  overflow: hidden; 
  background-color: var(--bg-color);
  color: var(--text-color);
}

.sidebar { 
  width: 250px; 
  background: var(--sidebar-bg); 
  padding: 2rem 1rem; 
  box-shadow: 2px 0 10px rgba(0,0,0,0.05); 
  z-index: 10;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: background-color 0.3s;
}

.main-content { 
  flex: 1; 
  padding: 2rem 3rem; 
  overflow-y: auto; 
  height: 100%; 
  box-sizing: border-box;
}

/* 3. ELEMENTS UI */
.logo { font-size: 1.5rem; font-weight: bold; color: var(--text-color); margin-bottom: 2rem; text-align: center; }
nav { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
nav a { padding: 0.8rem 1rem; text-decoration: none; color: var(--text-color); border-radius: 8px; transition: all 0.3s ease; }
nav a:hover { background: var(--border-color); }
nav a.router-link-exact-active { background: var(--primary-color); color: white; }

.theme-toggle {
  margin-top: auto;
  padding: 0.8rem;
  background: var(--border-color);
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  font-weight: bold;
}

.nav-warning { font-size: 0.8rem; color: var(--accent-color); padding: 1rem; text-align: center; font-style: italic; }

/* 4. IMPRESSION */
@media print {
  .sidebar, .theme-toggle, .no-print { display: none !important; }
  .main-content { padding: 0 !important; overflow: visible !important; }
  .app-wrapper { display: block !important; }
}
</style>