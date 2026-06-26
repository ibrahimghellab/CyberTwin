<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const email = ref('')
const password = ref('')

const handleLogin = async () => {
  if (email.value && password.value) {
    await authStore.login(email.value, password.value)
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card glass-panel">
      <div class="logo">🛡️ CyberTwin</div>
      <h2>Connexion Sécurisée</h2>
      <p class="subtitle">Accès réservé aux auditeurs et administrateurs.</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <label>
          Adresse Email
          <input type="email" v-model="email" required placeholder="admin@cybertwin.fr" />
        </label>
        
        <label>
          Mot de passe
          <input type="password" v-model="password" required placeholder="••••••••" />
        </label>

        <button type="submit" class="btn-primary">Se connecter</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 3rem 2.5rem;
  text-align: center;
  background: var(--surface);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border: 1px solid var(--border-color);
}

.logo { font-size: 2rem; font-weight: 800; color: var(--primary-color); margin-bottom: 1rem; }
h2 { margin: 0; color: var(--text-color); font-size: 1.5rem; }
.subtitle { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem; }

.login-form { display: flex; flex-direction: column; gap: 1.5rem; text-align: left; }
label { font-weight: bold; font-size: 0.9rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.5rem; }
input { padding: 0.8rem; border: 1px solid var(--border-color); border-radius: 8px; font-family: inherit; background: var(--bg-color); color: var(--text-color); }
input:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(41, 128, 185, 0.2); }

.btn-primary { background: var(--primary-color); color: white; padding: 1rem; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1rem; transition: 0.3s; margin-top: 0.5rem; }
.btn-primary:hover { background: var(--primary-hover); transform: translateY(-2px); }
</style>