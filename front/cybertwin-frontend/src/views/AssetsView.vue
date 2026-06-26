<script setup>
import { onMounted, ref } from 'vue'
import { useAssetStore } from '../stores/assetStore'
import { useAuthStore } from '../stores/authStore'

const assetStore = useAssetStore()
const authStore = useAuthStore()
const isCreating = ref(false)
const editingId = ref(null)

const assetTypes = ['Serveur Web', 'Base de données', 'Poste utilisateur', 'Routeur', 'Pare-feu', 'Application métier']

const newAsset = ref({ 
  name: '', 
  type: 'Serveur Web', 
  is_internet_facing: false, 
  description: '' 
})

const getIcon = (type) => {
  const icons = {
    'Serveur Web': '🌐', 'Base de données': '🗄️', 'Poste utilisateur': '💻',
    'Routeur': '📡', 'Pare-feu': '🧱', 'Application métier': '⚙️'
  }
  return icons[type] || '📦'
}

const handleSubmit = async () => {
  if (!newAsset.value.name) return
  
  if (editingId.value) {
    await assetStore.updateAsset(editingId.value, { ...newAsset.value })
  } else {
    await assetStore.addAsset({ ...newAsset.value })
  }
  
  cancelEdit()
}

const editAsset = (asset) => {
  editingId.value = asset.id
  newAsset.value = { ...asset }
  isCreating.value = true
}

// INTERCEPTION DE LA SUPPRESSION AVEC POP-UP
const deleteAsset = async (id) => {
  if (!confirm("Voulez-vous vraiment supprimer cet actif ? Toutes les vulnérabilités associées à cet équipement seront définitivement perdues.")) return
  await assetStore.removeAsset(id)
}

const cancelEdit = () => {
  isCreating.value = false
  editingId.value = null
  newAsset.value = { name: '', type: 'Serveur Web', is_internet_facing: false, description: '' }
}

onMounted(() => {
  assetStore.fetchAssets()
})
</script>

<template>
  <div class="container">
    <div class="header-actions">
      <h1>Inventaire du Parc</h1>
      <button v-if="authStore.user?.role === 'admin'" @click="cancelEdit(); isCreating = !isCreating" class="btn-primary">
        {{ isCreating ? 'Fermer le formulaire' : '+ Nouvel Actif' }}
      </button>
    </div>

    <transition name="slide-down">
      <form v-if="isCreating" class="glass-panel" @submit.prevent="handleSubmit">
        <h3>{{ editingId ? 'Modifier l\'équipement' : 'Déclarer un équipement' }}</h3>
        <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <label>Nom : <input v-model="newAsset.name" required style="width: 100%; padding: 0.5rem;"/></label>
          <label>Type :
            <select v-model="newAsset.type" style="width: 100%; padding: 0.5rem;">
              <option v-for="t in assetTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </label>
        </div>
        
        <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; cursor: pointer;">
          <input type="checkbox" v-model="newAsset.is_internet_facing" />
          <span style="font-weight: 600; color: #d32f2f;">⚠️ Cet équipement est exposé sur Internet</span>
        </label>
        
        <label>Description : 
          <textarea v-model="newAsset.description" rows="2" style="width: 100%; padding: 0.5rem; margin-bottom: 1rem;"></textarea>
        </label>
        
        <div style="display: flex; gap: 1rem;">
          <button type="submit" class="btn-primary" style="flex: 1;">
            {{ editingId ? 'Enregistrer les modifications' : 'Ajouter l\'actif' }}
          </button>
          <button v-if="editingId" type="button" @click="cancelEdit" class="btn-secondary" style="flex: 1;">Annuler</button>
        </div>
      </form>
    </transition>

    <div v-if="assetStore.assets.length === 0 && !isCreating" class="empty-state">
      Aucun actif enregistré pour cette entreprise.
    </div>

    <div v-else class="card-grid">
      <div v-for="asset in assetStore.assets" :key="asset.id" class="item-card">
        
        <div v-if="authStore.user?.role === 'admin'" class="card-actions">
          <button @click="editAsset(asset)" class="btn-action edit" title="Modifier">✏️</button>
          <button @click="deleteAsset(asset.id)" class="btn-action delete" title="Supprimer">×</button>
        </div>
        
        <div class="card-icon">{{ getIcon(asset.type) }}</div>
        <div class="card-content">
          <h3>{{ asset.name }}</h3>
          <span class="badge-type">{{ asset.type }}</span>
          <p class="description">{{ asset.description || 'Aucune description fournie.' }}</p>
        </div>
        
        <div v-if="asset.is_internet_facing" class="alert-footer">
          🌐 Connecté à Internet
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-actions { position: absolute; top: 10px; right: 10px; display: flex; gap: 0.5rem; }
.btn-action { background: var(--surface-alt); border: 1px solid var(--border-color); border-radius: 6px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; font-size: 1.1rem; color: var(--text-color); }
.btn-action.edit:hover { background: var(--primary-color); color: white; border-color: var(--primary-color); }
.btn-action.delete { font-size: 1.4rem; color: var(--text-muted); }
.btn-action.delete:hover { background: var(--danger-color); color: white; border-color: var(--danger-color); }
.btn-secondary { background: var(--surface-alt); color: var(--text-color); border: 1px solid var(--border-color); padding: 0.8rem; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s; }
.btn-secondary:hover { background: var(--border-color); }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.btn-primary { background: var(--primary-color); color: white; padding: 0.8rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; transition: 0.3s; font-weight: bold; }
.btn-primary:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.glass-panel { background: var(--surface); padding: 2rem; border-radius: 12px; margin-bottom: 2rem; box-shadow: 0 4px 15px var(--shadow-color-soft); border: 1px solid var(--border-color); }
label { font-weight: bold; font-size: 0.9rem; color: var(--text-muted); }
input, select, textarea { margin-top: 0.3rem; border: 1px solid var(--border-color); border-radius: 4px; font-family: inherit; background: var(--surface); color: var(--text-color); }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
.item-card { background: var(--surface); border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 4px 15px var(--shadow-color-soft); transition: all 0.3s ease; position: relative; display: flex; flex-direction: column; overflow: hidden; }
.item-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
.card-icon { font-size: 2.5rem; padding: 1.5rem 1.5rem 0 1.5rem; }
.card-content { padding: 1rem 1.5rem; flex: 1; }
.card-content h3 { margin: 0 0 0.5rem 0; color: var(--text-color); font-size: 1.1rem; }
.badge-type { display: inline-block; padding: 0.2rem 0.6rem; background: var(--surface-alt); border-radius: 12px; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.8rem; }
.description { font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; margin: 0; }
.alert-footer { background: rgba(244,67,54,0.12); color: var(--danger-color); padding: 0.6rem; text-align: center; font-size: 0.8rem; font-weight: bold; border-top: 1px solid rgba(244,67,54,0.2); }
.empty-state { text-align: center; padding: 3rem; color: var(--text-muted); font-style: italic; background: var(--surface-alt); border-radius: 12px; border: 1px dashed var(--border-color); }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.4s ease; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-20px); max-height: 0; padding: 0; margin: 0; border: none; }
.slide-down-enter-to, .slide-down-leave-from { max-height: 600px; }
</style>