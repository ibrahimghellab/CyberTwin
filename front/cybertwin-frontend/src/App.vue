<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useAppStore } from './stores/appStore'
import { useThemeStore } from './stores/themeStore'
import { useAuthStore } from './stores/authStore'
import { useToastStore } from './stores/toastStore'
import ToastContainer from './components/ToastContainer.vue'

const appStore = useAppStore()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

// --- GESTION DU PROFIL DE L'UTILISATEUR CONNECTÉ ---
const isEditingProfile = ref(false)
const profileForm = ref({ email: '', password: '' })

const openProfileModal = () => {
  profileForm.value = { email: authStore.user.email, password: '' }
  isEditingProfile.value = true
}

const saveMyProfile = async () => {
  try {
    const payload = { 
      email: profileForm.value.email, 
      role: authStore.user.role, 
      company_id: authStore.user.company_id 
    }
    if (profileForm.value.password) payload.password = profileForm.value.password

    const res = await fetch(`http://localhost:3000/auth/users/${authStore.user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (res.ok) {
      toastStore.addToast('Profil mis à jour !', 'success')
      authStore.user.email = payload.email // Mise à jour visuelle instantanée
      localStorage.setItem('user', JSON.stringify(authStore.user))
      isEditingProfile.value = false
    } else {
      const data = await res.json()
      toastStore.addToast(`Erreur : ${data.error}`, 'error')
    }
  } catch (err) {
    console.error(err)
  }
}

const deleteMyAccount = async () => {
  if (!confirm("ATTENTION : Voulez-vous vraiment supprimer définitivement votre compte ? Vous serez déconnecté immédiatement.")) return
  try {
    const res = await fetch(`http://localhost:3000/auth/users/${authStore.user.id}`, { method: 'DELETE' })
    if (res.ok) authStore.logout()
  } catch (err) { console.error(err) }
}
</script>

<template>
  <div :class="['app-wrapper', { 'dark-mode': themeStore.isDark }]">
    
    <aside v-if="authStore.token" class="sidebar">
      <div class="logo">CyberTwin</div>
      
      <div v-if="authStore.user" class="user-profile">
        <div class="profile-left">
          <div class="avatar">👤</div>
          <div class="user-info">
            <span class="user-email">{{ authStore.user.email }}</span>
            <span class="user-role badge-role">{{ authStore.user.role }}</span>
          </div>
        </div>
        <div class="profile-actions">
          <button @click="openProfileModal" class="btn-tiny" title="Modifier mon profil">✏️</button>
          <button @click="deleteMyAccount" class="btn-tiny danger" title="Supprimer mon compte">🗑️</button>
        </div>
      </div>

      <nav>
        <RouterLink v-if="authStore.user?.role === 'admin'" to="/entreprise">🏢 Entreprises</RouterLink>
        <RouterLink v-if="authStore.user?.role === 'admin'" to="/utilisateurs">👥 Utilisateurs</RouterLink>
        
        <template v-if="appStore.currentCompanyId">
          <RouterLink to="/actifs">Actifs</RouterLink>
          <RouterLink to="/vulnerabilites">Vulnérabilités</RouterLink>
          <RouterLink to="/dashboard">Tableau de bord</RouterLink>
          <RouterLink to="/rapport">Rapport</RouterLink>
        </template>
        <div v-else class="nav-warning">Sélectionnez une entreprise.</div>
      </nav>

      <div class="sidebar-footer">
        <div class="theme-toggle" @click="themeStore.toggleTheme">
          {{ themeStore.isDark ? '☀️ Mode Clair' : '🌙 Mode Sombre' }}
        </div>
        <button @click="authStore.logout" class="btn-logout">
          🚪 Se déconnecter
        </button>
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

    <div v-if="isEditingProfile" class="modal-overlay">
      <div class="modal-content glass-panel">
        <h2>Modifier mon profil</h2>
        <form @submit.prevent="saveMyProfile">
          <label style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1rem; font-weight:bold;">
            Email de connexion :
            <input type="email" v-model="profileForm.email" required style="padding:0.8rem; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-color);"/>
          </label>
          <label style="display:flex; flex-direction:column; gap:0.5rem; font-weight:bold;">
            Nouveau mot de passe <span style="font-size:0.75rem; font-weight:normal; color:var(--text-muted)">(laisser vide pour ne pas changer)</span> :
            <input type="password" v-model="profileForm.password" style="padding:0.8rem; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-color);"/>
          </label>
          <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            <button type="submit" class="btn-primary" style="flex:1; padding:0.8rem; border-radius:8px; border:none; cursor:pointer; background:var(--primary-color); color:white; font-weight:bold;">Sauvegarder</button>
            <button type="button" @click="isEditingProfile = false" style="flex:1; padding:0.8rem; border-radius:8px; border:1px solid var(--border-color); background:var(--surface-alt); color:var(--text-color); cursor:pointer; font-weight:bold;">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style>
/* ... Conserve tout ton CSS existant (:root, dark-mode, app-wrapper, etc.) ... */
:root { --bg-color: #f4f7f6; --surface: #ffffff; --surface-alt: #f8fafc; --text-color: #2c3e50; --text-muted: #64748b; --primary-color: #3498db; --primary-hover: #2980b9; --danger-color: #e74c3c; --warning-color: #f1c40f; --border-color: #e2e8f0; --shadow-color-soft: rgba(0, 0, 0, 0.05); font-family: 'Inter', sans-serif; }
.dark, .dark-theme, .dark-mode, [data-theme="dark"] { --bg-color: #0f172a; --surface: #1e293b; --surface-alt: #334155; --text-color: #f8fafc; --text-muted: #94a3b8; --border-color: #334155; --shadow-color-soft: rgba(0, 0, 0, 0.3); }
body { margin: 0; background-color: var(--bg-color); color: var(--text-color); transition: background-color 0.3s, color 0.3s; }
.app-wrapper { display: flex; height: 100vh; overflow: hidden; background-color: var(--bg-color); }
.sidebar { width: 280px; background: var(--surface); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; padding: 1.5rem; box-shadow: 2px 0 15px var(--shadow-color-soft); z-index: 10; transition: all 0.3s ease; }
.sidebar .logo { font-size: 1.8rem; font-weight: 900; color: var(--primary-color); margin-bottom: 2rem; text-align: center; letter-spacing: 1px; }

/* Nouveau style pour le badge profil */
.user-profile { display: flex; align-items: center; justify-content: space-between; background: var(--surface-alt); padding: 12px; border-radius: 12px; margin-bottom: 2rem; border: 1px solid var(--border-color); box-shadow: 0 2px 8px var(--shadow-color-soft); }
.profile-left { display: flex; align-items: center; gap: 10px; overflow: hidden; }
.profile-actions { display: flex; flex-direction: column; gap: 4px; }
.btn-tiny { background: transparent; border: none; cursor: pointer; font-size: 1rem; opacity: 0.6; transition: 0.2s; padding: 2px; }
.btn-tiny:hover { opacity: 1; transform: scale(1.15); }
.btn-tiny.danger:hover { filter: hue-rotate(150deg); } /* Effet visuel rapide */
.avatar { font-size: 1.8rem; }
.user-info { display: flex; flex-direction: column; overflow: hidden; }
.user-email { font-size: 0.85rem; font-weight: 700; color: var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px; }
.badge-role { font-size: 0.65rem; text-transform: uppercase; background: var(--primary-color); color: white; padding: 3px 8px; border-radius: 6px; align-self: flex-start; margin-top: 4px; font-weight: 800; }

nav { display: flex; flex-direction: column; gap: 0.5rem; }
nav a { text-decoration: none; color: var(--text-muted); font-weight: 600; padding: 0.8rem 1.2rem; border-radius: 8px; transition: all 0.2s ease; display: flex; align-items: center; gap: 10px; }
nav a:hover { background: var(--surface-alt); color: var(--primary-color); transform: translateX(5px); }
nav a.router-link-active { background: var(--primary-color); color: white; box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3); }
.nav-warning { font-size: 0.8rem; color: var(--warning-color); background: rgba(241, 196, 15, 0.1); padding: 0.8rem; border-radius: 8px; text-align: center; margin-top: 1rem; font-weight: bold; }
.sidebar-footer { margin-top: auto; display: flex; flex-direction: column; gap: 0.8rem; }
.theme-toggle { text-align: center; padding: 0.8rem; background: var(--surface-alt); border-radius: 8px; cursor: pointer; font-weight: bold; border: 1px solid var(--border-color); color: var(--text-color); transition: 0.2s; }
.theme-toggle:hover { background: var(--border-color); }
.btn-logout { padding: 0.8rem; background: transparent; color: var(--danger-color); border: 1px solid var(--danger-color); border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.3s; }
.btn-logout:hover { background: var(--danger-color); color: white; box-shadow: 0 4px 10px rgba(231, 76, 60, 0.3); }
.main-content { flex: 1; overflow-y: auto; padding: 2rem 3rem; background-color: var(--bg-color); transition: background-color 0.3s ease; }

/* Style de la Modale Profil */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); }
.modal-content { background: var(--surface); padding: 2.5rem; border-radius: 12px; width: 100%; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 1px solid var(--border-color); }
.modal-content h2 { margin-top: 0; margin-bottom: 1.5rem; color: var(--text-color); text-align: center; }

@media print { .sidebar, .toast-container, .modal-overlay { display: none !important; } .app-wrapper { height: auto !important; overflow: visible !important; background-color: white !important; } .main-content { flex: none !important; width: 100% !important; padding: 0 !important; margin: 0 !important; overflow: visible !important; background-color: white !important; } body { color: black !important; } .no-print { display: none !important; } }
</style>