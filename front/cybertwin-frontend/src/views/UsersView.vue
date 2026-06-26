<script setup>
import { ref, onMounted } from 'vue'
import { useToastStore } from '../stores/toastStore'
import { useAuthStore } from '../stores/authStore'

const toastStore = useToastStore()
const authStore = useAuthStore()

const users = ref([])
const companies = ref([])
const isCreating = ref(false)
const editingId = ref(null)

const newUser = ref({ email: '', password: '', role: 'user', company_id: '' })

const fetchData = async () => {
  try {
    const resUsers = await fetch('http://localhost:3000/auth/users')
    if (resUsers.ok) users.value = await resUsers.json()

    const resCompanies = await fetch('http://localhost:3000/companies')
    if (resCompanies.ok) companies.value = await resCompanies.json()
  } catch (err) {
    console.error(err)
  }
}

const handleSubmit = async () => {
  try {
    const payload = { ...newUser.value }
    if (payload.role === 'admin') delete payload.company_id
    if (editingId.value && !payload.password) delete payload.password

    const url = editingId.value 
      ? `http://localhost:3000/auth/users/${editingId.value}` 
      : 'http://localhost:3000/auth/register'
      
    const method = editingId.value ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (res.ok) {
      toastStore.addToast(editingId.value ? 'Compte mis à jour !' : 'Utilisateur créé !', 'success')
      
      // Si l'admin s'est modifié lui-même ici, on met à jour son badge
      if (editingId.value === authStore.user.id) {
        authStore.user.email = payload.email
        localStorage.setItem('user', JSON.stringify(authStore.user))
      }

      cancelEdit()
      fetchData()
    } else {
      const data = await res.json()
      toastStore.addToast(`Erreur : ${data.error}`, 'error')
    }
  } catch (err) {
    console.error(err)
  }
}

const editUser = (u) => {
  editingId.value = u.id
  newUser.value = { email: u.email, password: '', role: u.role, company_id: u.company_id || '' }
  isCreating.value = true
}

const deleteUser = async (id) => {
  const message = id === authStore.user.id 
    ? "Voulez-vous vraiment supprimer votre propre compte admin ? Cela vous déconnectera définitivement."
    : "Voulez-vous vraiment révoquer l'accès de cet utilisateur ?"
    
  if (!confirm(message)) return
  
  try {
    const res = await fetch(`http://localhost:3000/auth/users/${id}`, { method: 'DELETE' })
    if (res.ok) {
      if (id === authStore.user.id) {
        authStore.logout()
      } else {
        toastStore.addToast('Compte supprimé.', 'success')
        fetchData()
      }
    }
  } catch (error) {
    console.error(error)
  }
}

const cancelEdit = () => {
  isCreating.value = false
  editingId.value = null
  newUser.value = { email: '', password: '', role: 'user', company_id: '' }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="container">
    <div class="header-actions">
      <h1>Gestion des Utilisateurs</h1>
      <button @click="cancelEdit(); isCreating = !isCreating" class="btn-primary no-print">
        {{ isCreating ? 'Fermer' : '+ Nouvel Utilisateur' }}
      </button>
    </div>

    <transition name="slide-down">
      <form v-if="isCreating" class="glass-panel no-print" @submit.prevent="handleSubmit">
        <h3>{{ editingId ? 'Mettre à jour les accès' : 'Créer un nouvel accès' }}</h3>
        <div class="form-grid">
          <label>Email de connexion : <input type="email" v-model="newUser.email" required/></label>
          <label>Mot de passe <span v-if="editingId" style="font-size:0.7rem; font-weight:normal">(laisser vide pour inchangé)</span> : 
            <input type="password" v-model="newUser.password" :required="!editingId"/>
          </label>
          <label>Rôle attribué :
            <select v-model="newUser.role">
              <option value="user">Utilisateur (Consultation)</option>
              <option value="admin">Administrateur (Global)</option>
            </select>
          </label>
        </div>
        
        <label v-if="newUser.role === 'user'" style="margin-top: 1rem;">
          Entreprise rattachée :
          <select v-model="newUser.company_id" required>
            <option value="" disabled>Sélectionnez un client...</option>
            <option v-for="c in companies" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </label>

        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button type="submit" class="btn-primary" style="flex: 1;">Enregistrer</button>
          <button type="button" @click="cancelEdit" class="btn-secondary" style="flex: 1;">Annuler</button>
        </div>
      </form>
    </transition>

    <div class="users-table-container glass-panel">
      <table class="users-table">
        <thead>
          <tr>
            <th>Email de connexion</th>
            <th>Rôle</th>
            <th>Rattachement</th>
            <th class="no-print">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td class="email-cell"><strong>{{ user.email }}</strong></td>
            <td><span :class="['role-badge', user.role]">{{ user.role }}</span></td>
            <td>{{ user.company_name || 'Accès Global (Admin)' }}</td>
            <td class="no-print">
              
              <div class="action-buttons">
                <template v-if="user.id === authStore.user?.id || user.role === 'user'">
                  <button @click="editUser(user)" class="btn-icon edit" title="Modifier">✏️</button>
                  <button @click="deleteUser(user.id)" class="btn-icon delete" title="Supprimer">🗑️</button>
                </template>
                <span v-else class="protected-badge" style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">
                  🔒 Protégé
                </span>
              </div>

            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.action-buttons { display: flex; gap: 0.5rem; align-items: center; }
.btn-icon { background: var(--surface-alt); border: 1px solid var(--border-color); border-radius: 6px; width: 32px; height: 32px; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center; }
.btn-icon.edit:hover { background: var(--primary-color); border-color: var(--primary-color); color: white; }
.btn-icon.delete:hover { background: var(--danger-color); border-color: var(--danger-color); color: white; }
.btn-secondary { background: var(--surface-alt); color: var(--text-color); border: 1px solid var(--border-color); padding: 0.8rem; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s; }
.btn-secondary:hover { background: var(--border-color); }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.btn-primary { background: var(--primary-color); color: white; padding: 0.8rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.3s; }
.glass-panel { background: var(--surface); border-radius: 12px; box-shadow: 0 4px 15px var(--shadow-color-soft); border: 1px solid var(--border-color); overflow: hidden; margin-bottom: 2rem; padding: 2rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; }
label { font-weight: bold; font-size: 0.9rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.5rem; }
input, select { padding: 0.8rem; border: 1px solid var(--border-color); border-radius: 8px; font-family: inherit; background: var(--bg-color); color: var(--text-color); }
.users-table-container { padding: 0; }
.users-table { width: 100%; border-collapse: collapse; text-align: left; }
.users-table th { background: var(--surface-alt); padding: 1.2rem; font-size: 0.9rem; border-bottom: 2px solid var(--border-color); text-transform: uppercase; color: var(--text-muted); }
.users-table td { padding: 1.2rem; border-bottom: 1px solid var(--border-color); }
.role-badge { padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
.role-badge.admin { background: rgba(52, 152, 219, 0.15); color: #2980b9; }
.role-badge.user { background: rgba(149, 165, 166, 0.15); color: #7f8c8d; }
.email-cell { color: var(--primary-color); }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.4s ease; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-20px); max-height: 0; padding: 0; margin: 0; border: none; }
.slide-down-enter-to, .slide-down-leave-from { max-height: 500px; }
</style>