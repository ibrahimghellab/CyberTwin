<script setup>
import { onMounted, ref } from 'vue'
import { useAssetStore } from '../stores/assetStore'
import { useVulnerabilityStore } from '../stores/vulnerabilityStore'

const assetStore = useAssetStore()
const vulnStore = useVulnerabilityStore()
const isCreating = ref(false)

const newVuln = ref({ 
  assetId: '', 
  name: '', 
  description: '', 
  criticality: 'moyenne' 
})

const handleAdd = async () => {
  if (!newVuln.value.assetId || !newVuln.value.name) return
  await vulnStore.addVulnerability({ ...newVuln.value })
  
  isCreating.value = false
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
      <button @click="isCreating = !isCreating" class="btn-primary danger">
        {{ isCreating ? 'Annuler' : '+ Déclarer une faille' }}
      </button>
    </div>

    <div v-if="assetStore.assets.length === 0" class="empty-state">
      ⚠️ Ajoutez d'abord des équipements dans l'onglet "Actifs" pour pouvoir y associer des failles.
    </div>

    <template v-else>
      <transition name="slide-down">
        <form v-if="isCreating" class="glass-panel" @submit.prevent="handleAdd">
          <h3>Nouvelle vulnérabilité</h3>
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
          
          <button type="submit" class="btn-primary danger" style="width: 100%;">Enregistrer la faille</button>
        </form>
      </transition>

      <div class="card-grid">
        <div v-for="vuln in vulnStore.vulnerabilities" :key="vuln.id" class="item-card">
          <div :class="['card-header', vuln.criticality]">
            <span class="criticality-badge">{{ vuln.criticality }}</span>
            <button @click="vulnStore.removeVulnerability(vuln.id)" class="btn-delete-white" title="Résoudre">✓</button>
          </div>
          
          <div class="card-content">
            <h3>{{ vuln.title }}</h3>
            <div class="target-asset">🎯 Cible : <strong>{{ vuln.asset_name }}</strong></div>
            <p class="description">{{ vuln.description || 'Aucune description fournie.' }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.btn-primary { padding: 0.8rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; transition: 0.3s; font-weight: bold; color: white; }
.btn-primary.danger { background: #d32f2f; }
.btn-primary.danger:hover { background: #b71c1c; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(211, 47, 47, 0.2); }

.glass-panel { background: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eee; }
label { font-weight: bold; font-size: 0.9rem; color: #555; }
input, select, textarea { margin-top: 0.3rem; border: 1px solid #ccc; border-radius: 4px; font-family: inherit; }

.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
.item-card { 
  background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); 
  transition: all 0.3s ease; display: flex; flex-direction: column; overflow: hidden;
}
.item-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }

/* En-tête coloré selon la gravité */
.card-header { padding: 0.8rem 1.5rem; display: flex; justify-content: space-between; align-items: center; color: white; }
.card-header.faible { background: #4caf50; }
.card-header.moyenne { background: #ff9800; }
.card-header.élevée { background: #f44336; }
.card-header.critique { background: #b71c1c; }

.criticality-badge { text-transform: uppercase; font-size: 0.75rem; font-weight: 800; letter-spacing: 1px; }
.btn-delete-white { background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; transition: 0.2s; }
.btn-delete-white:hover { background: white; color: #333; }

.card-content { padding: 1.5rem; flex: 1; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px; }
.card-content h3 { margin: 0 0 0.8rem 0; color: #2c3e50; font-size: 1.1rem; }
.target-asset { font-size: 0.85rem; color: #1976d2; background: #e3f2fd; padding: 0.4rem 0.8rem; border-radius: 6px; display: inline-block; margin-bottom: 1rem; }
.description { font-size: 0.85rem; color: #666; line-height: 1.5; margin: 0; }

.empty-state { text-align: center; padding: 3rem; color: #888; background: #fff3cd; border-radius: 12px; border: 1px solid #ffeeba; }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.4s ease; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-20px); max-height: 0; padding: 0; margin: 0; border: none; }
.slide-down-enter-to, .slide-down-leave-from { max-height: 600px; }
</style>