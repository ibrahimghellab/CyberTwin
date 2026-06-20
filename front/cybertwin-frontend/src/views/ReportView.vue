<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAppStore } from '../stores/appStore'

const appStore = useAppStore()
const reportData = ref(null)
const isLoading = ref(false)

// La fonction cruciale qui crée la liaison avec la base de données
const fetchReport = async () => {
  if (!appStore.currentCompanyId) {
    reportData.value = null
    return
  }

  isLoading.value = true
  try {
    // LIAISON : Utilisation impérative des backticks (`) pour injecter le company_id dans l'URL
    const url = `http://localhost:3000/report?company_id=${appStore.currentCompanyId}`
    const res = await fetch(url)
    
    if (res.ok) {
      reportData.value = await res.json()
    }
  } catch (err) {
    console.error("Erreur lors de la génération du rapport :", err)
  } finally {
    isLoading.value = false
  }
}

// 1. Charge le rapport au montage de la page si une PME est sélectionnée
onMounted(() => {
  fetchReport()
})

// 2. Recharge automatiquement le rapport si tu changes de PME en cours de route
watch(() => appStore.currentCompanyId, () => {
  fetchReport()
})
</script>

<template>
  <div class="container">
    <div class="header-actions no-print">
      <h1>Générateur de Rapport</h1>
      <button v-if="reportData" class="btn-print" onclick="window.print()">
        🖨️ Exporter en PDF / Imprimer
      </button>
    </div>

    <div v-if="!appStore.currentCompanyId" class="empty-state no-print">
      ⚠️ Veuillez sélectionner une entreprise dans l'Annuaire pour générer son rapport d'audit.
    </div>
    
    <div v-else-if="isLoading" class="loading-state no-print">
      <div class="spinner"></div>
      <p>Compilation des données et génération du rapport...</p>
    </div>
    
    <div v-else-if="reportData" class="report-paper">
      <header class="report-header">
        <div class="header-main">
          <h1>Rapport d'Audit de Sécurité Numérique</h1>
          <h2>Entreprise : {{ reportData.company.name }}</h2>
          <p class="sector-tag">Secteur d'activité : {{ reportData.company.sector }}</p>
        </div>
        <div class="header-meta">
          <p><strong>Date d'analyse :</strong> {{ new Date(reportData.generated_at).toLocaleDateString('fr-FR') }}</p>
          <p><strong>Heure :</strong> {{ new Date(reportData.generated_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}</p>
        </div>
      </header>

      <section class="report-section">
        <h3>1. Évaluation Global du Risque Cyber</h3>
        <p class="section-desc">Score calculé par le moteur de risque CyberTwin basé sur l'exposition et les vulnérabilités de l'infrastructure.</p>
        
        <div :class="['risk-summary-box', reportData.risk.level]">
          <div class="risk-score-big">{{ reportData.risk.score }}<span>/100</span></div>
          <div class="risk-text-status">Indice de vulnérabilité : <strong>{{ reportData.risk.level }}</strong></div>
        </div>
      </section>

      <section class="report-section">
        <h3>2. État du Parc Informatique et Failles Associées</h3>
        <p class="section-desc">Détail des équipements identifiés et des vulnérabilités de sécurité actives.</p>
        
        <div class="assets-report-list">
          <div v-for="asset in reportData.assets" :key="asset.id" class="asset-report-item">
            <div class="asset-report-meta">
              <h4>{{ asset.name }}</h4>
              <span class="report-badge-type">{{ asset.type }}</span>
              <span v-if="asset.is_internet_facing" class="internet-facing-alert">🌐 Exposé sur Internet</span>
            </div>
            
            <div v-if="asset.vulnerabilities.length > 0" class="vulns-report-sublist">
              <h5>Vulnérabilités critiques détectées :</h5>
              <ul>
                <li v-for="v in asset.vulnerabilities" :key="v.id">
                  <span :class="['mini-crit-badge', v.criticality]">{{ v.criticality }}</span>
                  <strong>{{ v.title }}</strong>
                  <p v-if="v.description" class="vuln-report-desc">{{ v.description }}</p>
                </li>
              </ul>
            </div>
            <div v-else class="asset-clean-success">
              ✓ Aucun défaut de sécurité majeur détecté sur cet équipement.
            </div>
          </div>
        </div>
      </section>

      <section class="report-section recommendations-box">
        <h3>3. Plan d'Action & Préconisations Routières</h3>
        <p class="section-desc">Mesures correctives immédiates recommandées pour abaisser l'indice de risque global.</p>
        
        <ul class="rec-list">
          <li v-for="(rec, index) in reportData.recommendations" :key="index">
            <span class="rec-number">{{ index + 1 }}</span>
            <p>{{ rec }}</p>
          </li>
        </ul>
      </section>

      <footer class="report-footer">
        <p>Document confidentiel généré par le jumeau numérique CyberTwin. Tous droits réservés.</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.btn-print { background: #2c3e50; color: white; padding: 0.8rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s; }
.btn-print:hover { background: #1a252f; transform: translateY(-2px); }

/* Feuille de style "Papier A4" */
.report-paper { background: white; padding: 3.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.04); border-radius: 8px; border: 1px solid #e2e8f0; font-family: 'Inter', sans-serif; color: #1a202c; }
.report-header { display: flex; justify-content: space-between; border-bottom: 3px solid #2c3e50; padding-bottom: 1.5rem; margin-bottom: 2.5rem; }
.header-main h1 { font-size: 1.6rem; color: #2c3e50; margin: 0 0 0.5rem 0; font-weight: 800; }
.header-main h2 { font-size: 1.2rem; color: #4a5568; margin: 0; font-weight: 600; }
.sector-tag { font-size: 0.85rem; color: #718096; margin-top: 0.3rem; }
.header-meta { text-align: right; font-size: 0.85rem; color: #4a5568; line-height: 1.6; }

.report-section { margin-bottom: 3rem; }
.report-section h3 { font-size: 1.2rem; color: #2c3e50; border-left: 4px solid #2c3e50; padding-left: 0.6rem; margin: 0 0 0.4rem 0; font-weight: 700; }
.section-desc { font-size: 0.85rem; color: #718096; margin: 0 0 1.5rem 0; font-style: italic; }

/* Bloc Risk de Synthèse */
.risk-summary-box { padding: 1.5rem; border-radius: 8px; text-align: center; max-width: 350px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
.risk-summary-box.faible { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
.risk-summary-box.moyen { background: #fff7ed; border: 1px solid #ffedd5; color: #9a3412; }
.risk-summary-box.élevé { background: #fef2f2; border: 1px solid #fee2e2; color: #991b1b; }

.risk-score-big { font-size: 3.5rem; font-weight: 900; line-height: 1; }
.risk-score-big span { font-size: 1.2rem; font-weight: normal; opacity: 0.6; }
.risk-text-status { margin-top: 0.5rem; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.5px; }

/* Liste des équipements */
.assets-report-list { display: flex; flex-direction: column; gap: 1.5rem; }
.asset-report-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.2rem; }
.asset-report-meta { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.8rem; flex-wrap: wrap; }
.asset-report-meta h4 { margin: 0; font-size: 1.05rem; color: #334155; }
.report-badge-type { background: #e2e8f0; font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 4px; color: #475569; font-weight: 600; }
.internet-facing-alert { font-size: 0.75rem; color: #ef4444; background: #fee2e2; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: bold; }

.vulns-report-sublist { border-top: 1px dashed #cbd5e1; margin-top: 0.8rem; padding-top: 0.8rem; }
.vulns-report-sublist h5 { margin: 0 0 0.6rem 0; font-size: 0.85rem; color: #64748b; text-transform: uppercase; }
.vulns-report-sublist ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem; }
.vulns-report-sublist li { font-size: 0.9rem; padding-left: 0.5rem; }

.mini-crit-badge { display: inline-block; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; padding: 0.1rem 0.4rem; border-radius: 3px; color: white; margin-right: 0.5rem; vertical-align: middle; }
.mini-crit-badge.faible { background: #4caf50; }
.mini-crit-badge.moyenne { background: #ff9800; }
.mini-crit-badge.élevée { background: #f44336; }
.mini-crit-badge.critique { background: #b71c1c; }

.vuln-report-desc { margin: 0.2rem 0 0 1.8rem; font-size: 0.8rem; color: #64748b; line-height: 1.4; }
.asset-clean-success { font-size: 0.85rem; color: #166534; padding-top: 0.3rem; }

/* Recommandations */
.recommendations-box { background: #f8fafc; padding: 2rem; border-radius: 8px; border: 1px solid #e2e8f0; }
.rec-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem; }
.rec-list li { display: flex; gap: 1rem; align-items: flex-start; }
.rec-number { background: #2c3e50; color: white; border-radius: 50%; min-width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold; }
.rec-list p { margin: 0; font-size: 0.9rem; line-height: 1.5; color: #334155; padding-top: 2px; }

.report-footer { border-top: 1px solid #e2e8f0; margin-top: 4rem; padding-top: 1rem; text-align: center; font-size: 0.75rem; color: #94a3b8; }

/* Gestion propre des états vides/chargements */
.empty-state { text-align: center; padding: 3rem; color: #888; background: #fff3cd; border-radius: 12px; border: 1px solid #ffeeba; }
.loading-state { text-align: center; padding: 4rem; color: #666; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #2c3e50; border-radius: 50%; width: 35px; height: 35px; animation: spin 1s linear infinite; margin: 0 auto 1rem auto; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* CSS IMPRESSION : Masquage parfait lors du clic sur Exporter en PDF */
@media print {
  .no-print { display: none !important; }
  .report-paper { box-shadow: none !important; border: none !important; padding: 0 !important; background: transparent !important; }
  body { background: white !important; }
}
</style>