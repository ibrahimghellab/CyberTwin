<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/appStore'
import { useAuthStore } from '../stores/authStore'
import { useToastStore } from '../stores/toastStore'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const companies = ref([])
const isCreating = ref(false)
const editingId = ref(null) // 👈 Permet de savoir si on modifie une entreprise existante

const newCompany = ref({ name: '', industry: '', contact_email: '' })

const fetchCompanies = async () => {
  try {
    const res = await fetch('http://localhost:3000/companies')
    if (res.ok) {
      companies.value = await res.json()
      
      // Auto-redirection pour un utilisateur standard qui n'a qu'une seule entreprise
      if (authStore.user?.role === 'user' && companies.value.length === 1) {
        selectCompany(companies.value[0].id)
      }
    }
  } catch (error) {
    console.error(error)
  }
}

const saveCompany = async () => {
  try {
    // Si on a un editingId, on modifie (PUT), sinon on crée (POST)
    const url = editingId.value 
      ? `http://localhost:3000/companies/${editingId.value}` 
      : 'http://localhost:3000/companies'
      
    const method = editingId.value ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCompany.value)
    })
    
    if (res.ok) {
      toastStore.addToast(editingId.value ? 'Entreprise mise à jour !' : 'Entreprise ajoutée !', 'success')
      cancelEdit() // On referme et on vide le formulaire
      fetchCompanies()
    } else {
      toastStore.addToast('Erreur lors de la sauvegarde.', 'error')
    }
  } catch (error) {
    console.error(error)
  }
}

const editCompany = (company) => {
  editingId.value = company.id
  newCompany.value = { ...company } // On pré-remplit le formulaire
  isCreating.value = true // On ouvre le panneau
}

const deleteCompany = async (id) => {
  // Avertissement de sécurité important
  if (!confirm("ATTENTION : Supprimer cette entreprise supprimera aussi tous ses actifs, vulnérabilités et utilisateurs liés ! Continuer ?")) return
  
  try {
    const res = await fetch(`http://localhost:3000/companies/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toastStore.addToast('Entreprise et données liées supprimées.', 'success')
      
      // Si l'admin était en train de travailler sur cette entreprise, on le sort
      if (appStore.currentCompanyId === id) appStore.setCompany(null)
      fetchCompanies()
    }
  } catch (error) {
    console.error(error)
  }
}

const cancelEdit = () => {
  isCreating.value = false
  editingId.value = null
  newCompany.value = { name: '', industry: '', contact_email: '' }
}

const selectCompany = (id) => {
  appStore.setCompany(id)
  router.push('/actifs')
}

onMounted(() => {
  fetchCompanies()
})
</script>

<template>
  <div class="container">
    <div class="header-actions">
      <h1>Annuaire des Entreprises</h1>
      <!-- Seul l'admin peut invoquer le panneau -->
      <button v-if="authStore.user?.role === 'admin'" @click="cancelEdit(); isCreating = !isCreating" class="btn-primary no-print">
        {{ isCreating ? 'Fermer le formulaire' : '+ Nouvelle Entreprise' }}
      </button>
    </div>

    <!-- Le formulaire intelligent (Création / Modification) -->
    <transition name="slide-down">
      <form v-if="isCreating" class="glass-panel no-print" @submit.prevent="saveCompany">
        <h3>{{ editingId ? "Modifier les informations du client" : "Enregistrer un nouveau client" }}</h3>
        
        <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <label>Nom de l'entreprise : 
            <input v-model="newCompany.name" required style="width: 100%; padding: 0.8rem;"/>
          </label>
          <label>Secteur d'activité : 
            <input v-model="newCompany.industry" style="width: 100%; padding: 0.8rem;"/>
          </label>
        </div>
        <label>Email de contact (Référent) : 
          <input type="email" v-model="newCompany.contact_email" style="width: 100%; padding: 0.8rem; margin-bottom: 1rem;"/>
        </label>
        
        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
          <button type="submit" class="btn-primary" style="flex: 1;">
            {{ editingId ? 'Enregistrer les modifications' : 'Ajouter au portefeuille' }}
          </button>
          <button v-if="editingId" type="button" @click="cancelEdit" class="btn-secondary" style="flex: 1;">
            Annuler
          </button>
        </div>
      </form>
    </transition>

    <div class="card-grid">
      <div v-for="company in companies" :key="company.id" class="item-card" @click="selectCompany(company.id)">
        
        <!-- BOUTONS D'ACTION (Uniquement pour les Admins). Le @click.stop empêche d'entrer dans l'entreprise quand on clique sur le bouton -->
        <div v-if="authStore.user?.role === 'admin'" class="card-actions no-print">
          <button @click.stop="editCompany(company)" class="btn-action edit" title="Modifier l'entreprise">✏️</button>
          <button @click.stop="deleteCompany(company.id)" class="btn-action delete" title="Supprimer l'entreprise">🗑️</button>
        </div>

        <div class="card-icon">🏢</div>
        <div class="card-content">
          <h3>{{ company.name }}</h3>
          <span class="badge-type">{{ company.industry || 'Non spécifié' }}</span>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;" v-if="company.contact_email">
            ✉️ {{ company.contact_email }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Les boutons sur la carte de l'entreprise */
.card-actions { position: absolute; top: 10px; right: 10px; display: flex; gap: 0.5rem; z-index: 2; }
.btn-action { background: var(--surface-alt); border: 1px solid var(--border-color); border-radius: 6px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; font-size: 1rem; color: var(--text-color); }
.btn-action.edit:hover { background: var(--primary-color); color: white; border-color: var(--primary-color); }
.btn-action.delete:hover { background: var(--danger-color); color: white; border-color: var(--danger-color); }

.btn-secondary { background: var(--surface-alt); color: var(--text-color); border: 1px solid var(--border-color); padding: 0.8rem; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s; }
.btn-secondary:hover { background: var(--border-color); }

.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.btn-primary { background: var(--primary-color); color: white; padding: 0.8rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.3s; }
.btn-primary:hover { background: var(--primary-hover); transform: translateY(-2px); }
.glass-panel { background: var(--surface); padding: 2rem; border-radius: 12px; margin-bottom: 2rem; box-shadow: 0 4px 15px var(--shadow-color-soft); border: 1px solid var(--border-color); }
label { font-weight: bold; font-size: 0.9rem; color: var(--text-muted); }
input { margin-top: 0.3rem; border: 1px solid var(--border-color); border-radius: 8px; font-family: inherit; background: var(--bg-color); color: var(--text-color); }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
.item-card { background: var(--surface); border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 4px 15px var(--shadow-color-soft); transition: all 0.3s ease; cursor: pointer; text-align: center; position: relative; overflow: hidden; }
.item-card:hover { transform: translateY(-3px); border-color: var(--primary-color); box-shadow: 0 8px 20px rgba(52, 152, 219, 0.2); }
.card-icon { font-size: 3rem; padding: 2rem 0 0.5rem 0; }
.card-content { padding: 1rem 1.5rem 1.5rem 1.5rem; }
.card-content h3 { margin: 0 0 0.5rem 0; color: var(--text-color); }
.badge-type { font-size: 0.8rem; color: var(--text-muted); background: var(--surface-alt); padding: 0.3rem 0.6rem; border-radius: 12px; font-weight: bold; }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.4s ease; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-20px); max-height: 0; padding: 0; margin: 0; border: none; }
.slide-down-enter-to, .slide-down-leave-from { max-height: 500px; }
</style>