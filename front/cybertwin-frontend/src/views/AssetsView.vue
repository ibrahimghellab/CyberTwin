<script setup>
import { onMounted, ref } from 'vue'
import { useAssetStore } from '../stores/assetStore'

const assetStore = useAssetStore()
const isCreating = ref(false)

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

const handleAdd = async () => {
  if (!newAsset.value.name) return
  await assetStore.addAsset({ ...newAsset.value })
  
  isCreating.value = false
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
      <button @click="isCreating = !isCreating" class="btn-primary">
        {{ isCreating ? 'Annuler' : '+ Nouvel Actif' }}
      </button>
    </div>

    <transition name="slide-down">
      <form v-if="isCreating" class="glass-panel" @submit.prevent="handleAdd">
        <h3>Déclarer un équipement</h3>
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
        
        <button type="submit" class="btn-primary" style="width: 100%;">Ajouter l'actif</button>
      </form>
    </transition>

    <div v-if="assetStore.assets.length === 0 && !isCreating" class="empty-state">
      Aucun actif enregistré pour cette entreprise.
    </div>

    <div v-else class="card-grid">
      <div v-for="asset in assetStore.assets" :key="asset.id" class="item-card">
        <button @click="assetStore.removeAsset(asset.id)" class="btn-delete" title="Supprimer">×</button>
        
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
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.btn-primary { background: #2c3e50; color: white; padding: 0.8rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; transition: 0.3s; font-weight: bold; }
.btn-primary:hover { background: #1a252f; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

.glass-panel { background: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eee; }
label { font-weight: bold; font-size: 0.9rem; color: #555; }
input, select, textarea { margin-top: 0.3rem; border: 1px solid #ccc; border-radius: 4px; font-family: inherit; }

.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
.item-card { 
  background: white; border-radius: 12px; border: 1px solid #eee; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.02); transition: all 0.3s ease; 
  position: relative; display: flex; flex-direction: column; overflow: hidden;
}
.item-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); }

.btn-delete { position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 1.5rem; color: #999; cursor: pointer; transition: 0.2s; }
.btn-delete:hover { color: #d32f2f; }

.card-icon { font-size: 2.5rem; padding: 1.5rem 1.5rem 0 1.5rem; }
.card-content { padding: 1rem 1.5rem; flex: 1; }
.card-content h3 { margin: 0 0 0.5rem 0; color: #2c3e50; font-size: 1.1rem; }
.badge-type { display: inline-block; padding: 0.2rem 0.6rem; background: #eef2f5; border-radius: 12px; font-size: 0.8rem; color: #555; margin-bottom: 0.8rem; }
.description { font-size: 0.85rem; color: #777; line-height: 1.4; margin: 0; }

.alert-footer { background: #ffebee; color: #c62828; padding: 0.6rem; text-align: center; font-size: 0.8rem; font-weight: bold; border-top: 1px solid #ffcdd2; }
.empty-state { text-align: center; padding: 3rem; color: #888; font-style: italic; background: white; border-radius: 12px; border: 1px dashed #ccc; }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.4s ease; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-20px); max-height: 0; padding: 0; margin: 0; border: none; }
.slide-down-enter-to, .slide-down-leave-from { max-height: 600px; }
</style>