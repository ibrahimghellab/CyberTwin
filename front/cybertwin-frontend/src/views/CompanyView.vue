<script setup>
import { onMounted, ref } from 'vue'
import { useAppStore } from '../stores/appStore'

const appStore = useAppStore()
const companies = ref([])
const isCreating = ref(false)

// Les champs pour la nouvelle entreprise
const newCompany = ref({ 
  name: '', 
  sector: '', 
  employees_count: 0,
  servers_count: 0,
  workstations_count: 0,
  exposed_services: ''
})

// Récupérer toutes les entreprises (Nouvelle route au pluriel)
const fetchCompanies = async () => {
  try {
    const res = await fetch('http://localhost:3000/companies')
    if (res.ok) {
      companies.value = await res.json()
    }
  } catch (err) { console.error("Erreur de récupération:", err) }
}

// Fonction pour sauvegarder la PME
const saveCompany = async () => {
  try {
    const res = await fetch('http://localhost:3000/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCompany.value)
    })
    
    if (res.ok) {
      await fetchCompanies() // Recharge la liste avec la nouvelle entreprise
      isCreating.value = false // Ferme le panneau glissant
      
      // Réinitialise le formulaire pour la prochaine fois
      newCompany.value = { 
        name: '', sector: '', employees_count: 0, servers_count: 0, workstations_count: 0, exposed_services: '' 
      }
    }
  } catch (err) { 
    console.error("Erreur lors de l'enregistrement :", err) 
  }
}

// Sélectionner une entreprise pour travailler dessus
const selectCompany = (id) => {
  appStore.setCompany(id)
}

onMounted(fetchCompanies)
</script>

<template>
  <div class="container">
    <div class="header-actions">
      <h1>Annuaire des Entreprises</h1>
      <button @click="isCreating = !isCreating" class="btn-primary">
        {{ isCreating ? 'Annuler' : '+ Nouvelle Entreprise' }}
      </button>
    </div>

    <transition name="slide-down">
      <form v-if="isCreating" class="glass-panel" @submit.prevent="saveCompany">
        <h3>Créer un nouveau profil</h3>
        <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <label>Nom : <input v-model="newCompany.name" required style="width: 100%; padding: 0.5rem;"/></label>
          <label>Secteur : <input v-model="newCompany.sector" required style="width: 100%; padding: 0.5rem;"/></label>
          <label>Employés : <input type="number" v-model="newCompany.employees_count" style="width: 100%; padding: 0.5rem;"/></label>
          <label>Serveurs : <input type="number" v-model="newCompany.servers_count" style="width: 100%; padding: 0.5rem;"/></label>
          <label>Postes : <input type="number" v-model="newCompany.workstations_count" style="width: 100%; padding: 0.5rem;"/></label>
          <label>Services : <input v-model="newCompany.exposed_services" placeholder="Ex: API" style="width: 100%; padding: 0.5rem;"/></label>
        </div>
        <button type="submit" class="btn-primary" style="width: 100%;">Enregistrer l'entreprise</button>
      </form>
    </transition>

    <div class="company-grid">
      <div 
        v-for="company in companies" 
        :key="company.id" 
        :class="['company-card', { active: appStore.currentCompanyId === company.id }]"
        @click="selectCompany(company.id)"
      >
        <div class="card-icon">🏢</div>
        <h3>{{ company.name }}</h3>
        <span class="sector">{{ company.sector }}</span>
        <div class="card-stats">
          <span>👥 {{ company.employees_count }} employés</span>
        </div>
        <div v-if="appStore.currentCompanyId === company.id" class="active-badge">Sélectionnée</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.btn-primary { background: #2c3e50; color: white; padding: 0.8rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; transition: 0.3s; }
.btn-primary:hover { background: #1a252f; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

/* Style du formulaire */
.glass-panel { background: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eee; }
label { font-weight: bold; font-size: 0.9rem; color: #555; }
input { margin-top: 0.3rem; border: 1px solid #ccc; border-radius: 4px; }

.company-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; }
.company-card { 
  background: white; border-radius: 12px; padding: 1.5rem; cursor: pointer;
  border: 2px solid transparent; box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  transition: all 0.3s ease; position: relative; overflow: hidden;
}
.company-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); }
.company-card.active { border-color: #42b983; background: #fafffc; }

.card-icon { font-size: 2rem; margin-bottom: 1rem; }
.company-card h3 { margin: 0 0 0.5rem 0; color: #2c3e50; }
.sector { display: inline-block; padding: 0.3rem 0.8rem; background: #eef2f5; border-radius: 20px; font-size: 0.85rem; color: #666; margin-bottom: 1rem; }
.active-badge { position: absolute; top: 1rem; right: -2rem; background: #42b983; color: white; font-size: 0.7rem; font-weight: bold; padding: 0.3rem 2.5rem; transform: rotate(45deg); }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.4s ease; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-20px); max-height: 0; padding: 0; margin: 0; border: none; }
.slide-down-enter-to, .slide-down-leave-from { max-height: 500px; }
</style>