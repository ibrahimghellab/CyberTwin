<script setup>
import { onMounted, ref } from 'vue'
import { useAssetStore } from '../stores/assetStore'
import { useVulnerabilityStore } from '../stores/vulnerabilityStore'
import { useAuthStore } from '../stores/authStore'

const assetStore = useAssetStore()
const vulnStore = useVulnerabilityStore()
const authStore = useAuthStore()
const isCreating = ref(false)
const editingId = ref(null)

const newVuln = ref({ 
  assetId: '', 
  name: '', 
  description: '', 
  criticality: 'moyenne' 
})

const handleSubmit = async () => {
  if (!newVuln.value.assetId || !newVuln.value.name) return
  
  if (editingId.value) {
    await vulnStore.updateVulnerability(editingId.value, { ...newVuln.value })
  } else {
    await vulnStore.addVulnerability({ ...newVuln.value })
  }
  
  cancelEdit()
}

const editVuln = (vuln) => {
  editingId.value = vuln.id
  newVuln.value = { 
    assetId: Number(vuln.asset_id), 
    name: vuln.title || vuln.name, 
    description: vuln.description, 
    criticality: vuln.criticality 
  }
  isCreating.value = true
}

// INTERCEPTION DE LA SUPPRESSION/RÉSOLUTION AVEC POP-UP
const deleteVulnerability = async (id) => {
  if (!confirm("Confirmez-vous que cette vulnérabilité est résolue ? Elle sera définitivement retirée du registre.")) return
  await vulnStore.removeVulnerability(id)
}

const cancelEdit = () => {
  isCreating.value = false
  editingId.value = null
  newVuln.value = { assetId: '', name: '', description: '', criticality: 'moyenne' }
}

onMounted(() => {
  assetStore.fetchAssets()
  vulnStore.fetchVulnerabilities()
})
</script>

<template>
  <div class="container">
    <div class="header-actions">
      <h1>Registre des Vulnérabilités</h1>
      <button v-if="authStore.user?.role === 'admin'" @click="cancelEdit(); isCreating = !isCreating" class="btn-primary danger">
        {{ isCreating ? 'Fermer' : '+ Déclarer une faille' }}
      </button>
    </div>

    <div v-if="assetStore.assets.length === 0" class="empty-state">
      ⚠️ Ajoutez d'abord des équipements dans l'onglet "Actifs" pour pouvoir y associer des failles.
    </div>

    <template v-else>
      <transition name="slide-down">
        <form v-if="isCreating" class="glass-panel" @submit.prevent="handleSubmit">
          <h3>{{ editingId ? 'Modifier la vulnérabilité' : 'Nouvelle vulnérabilité' }}</h3>
          <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <label>Actif cible :
              <select v-model="newVuln.assetId" required style="width: 100%; padding: 0.5rem;">
                <option value="" disabled>Sélectionnez...</option>
                <option v-for="a in assetStore.assets" :key="a.id" :value="a.id">{{ a.name }}</option>
              </select>
            </label>
            <label>Titre de la faille : <input v-model="newVuln.name" required style="width: 100%; padding: 0.5rem;"/></label>
          </div>
          
          <label>Criticité :
            <select v-model="newVuln.criticality" style="width: 100%; padding: 0.5rem; margin-bottom: 1rem;">
              <option value="faible">Faible</option>
              <option value="moyenne">Moyenne</option>
              <option value="élevée">Élevée</option>
              <option value="critique">Critique</option>
            </select>
          </label>

          <label>Description technique : 
            <textarea v-model="newVuln.description" rows="3" style="width: 100%; padding: 0.5rem; margin-bottom: 1rem;"></textarea>
          </label>
          
          <div style="display: flex; gap: 1rem;">
            <button type="submit" class="btn-primary danger" style="flex: 1;">
              {{ editingId ? 'Mettre à jour' : 'Enregistrer la faille' }}
            </button>
            <button v-if="editingId" type="button" @click="cancelEdit" class="btn-secondary" style="flex: 1;">Annuler</button>
          </div>
        </form>
      </transition>

      <div class="card-grid">
        <div v-for="vuln in vulnStore.vulnerabilities" :key="vuln.id" class="item-card">
          <div :class="['card-header', vuln.criticality]">
            <span class="criticality-badge">{{ vuln.criticality }}</span>
            <div v-if="authStore.user?.role === 'admin'" style="display: flex; gap: 0.5rem;">
              <button @click="editVuln(vuln)" class="btn-delete-white" title="Modifier">✏️</button>
              <button @click="deleteVulnerability(vuln.id)" class="btn-delete-white" title="Résoudre">✓</button>
            </div>
          </div>
          
          <div class="card-content">
            <h3>{{ vuln.title || vuln.name }}</h3>
            <div class="target-asset">🎯 Cible : <strong>{{ vuln.asset_name }}</strong></div>
            <p class="description">{{ vuln.description || 'Aucune description fournie.' }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.btn-secondary { background: var(--surface-alt); color: var(--text-color); border: 1px solid var(--border-color); padding: 0.8rem; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s; }
.btn-secondary:hover { background: var(--border-color); }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.btn-primary { padding: 0.8rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; transition: 0.3s; font-weight: bold; color: white; }
.btn-primary.danger { background: #d32f2f; }
.btn-primary.danger:hover { background: #b71c1c; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(211, 47, 47, 0.2); }
.glass-panel { background: var(--surface); padding: 2rem; border-radius: 12px; margin-bottom: 2rem; box-shadow: 0 4px 15px var(--shadow-color-soft); border: 1px solid var(--border-color); }
label { font-weight: bold; font-size: 0.9rem; color: var(--text-muted); }
input, select, textarea { margin-top: 0.3rem; border: 1px solid var(--border-color); border-radius: 4px; font-family: inherit; background: var(--surface); color: var(--text-color); }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
.item-card { background: var(--surface); border-radius: 12px; box-shadow: 0 4px 15px var(--shadow-color-soft); border: 1px solid var(--border-color); transition: all 0.3s ease; display: flex; flex-direction: column; overflow: hidden; }
.item-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
.card-header { padding: 0.8rem 1.5rem; display: flex; justify-content: space-between; align-items: center; color: white; }
.card-header.faible { background: var(--success-color); }
.card-header.moyenne { background: var(--warning-color); }
.card-header.élevée { background: #f44336; }
.card-header.critique { background: #b71c1c; }
.criticality-badge { text-transform: uppercase; font-size: 0.75rem; font-weight: 800; letter-spacing: 1px; }
.btn-delete-white { background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; transition: 0.2s; font-size: 0.9rem; }
.btn-delete-white:hover { background: var(--surface); color: var(--text-color); }
.card-content { padding: 1.5rem; flex: 1; border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 12px 12px; background: var(--surface-alt); }
.card-content h3 { margin: 0 0 0.8rem 0; color: var(--text-color); font-size: 1.1rem; }
.target-asset { font-size: 0.85rem; color: var(--primary-color); background: var(--surface); padding: 0.4rem 0.8rem; border-radius: 6px; display: inline-block; margin-bottom: 1rem; }
.description { font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin: 0; }
.empty-state { text-align: center; padding: 3rem; color: var(--text-muted); background: var(--surface-alt); border-radius: 12px; border: 1px solid var(--border-color); }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.4s ease; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-20px); max-height: 0; padding: 0; margin: 0; border: none; }
.slide-down-enter-to, .slide-down-leave-from { max-height: 600px; }
</style>