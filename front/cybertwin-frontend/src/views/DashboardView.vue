<script setup>
import { onMounted, computed, watch } from 'vue'
import { useRiskStore } from '../stores/riskStore'
import { useAppStore } from '../stores/appStore'

// Importation des modules Chart.js
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'

// Enregistrement des éléments graphiques
ChartJS.register(ArcElement, Tooltip, Legend)

const riskStore = useRiskStore()
const appStore = useAppStore()

// Charge les données au montage si une entreprise est déjà sélectionnée
onMounted(() => {
  if (appStore.currentCompanyId) {
    riskStore.fetchDashboard()
  }
})

// Met à jour le dashboard automatiquement si l'utilisateur change d'entreprise dans le menu
watch(() => appStore.currentCompanyId, (newId) => {
  if (newId) {
    riskStore.fetchDashboard()
  } else {
    riskStore.dashboardData = null
  }
})
// --- CONFIGURATION DES GRAPHIQUES ---

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { padding: 20, font: { family: 'Inter' } } }
  },
  cutout: '70%' // Crée l'effet "Doughnut" fin et élégant
}

// Graphique 1 : Répartition des actifs
const assetChartData = computed(() => {
  if (!riskStore.dashboardData || !riskStore.dashboardData.assets_distribution) return null
  
  const data = riskStore.dashboardData.assets_distribution
  return {
    labels: Object.keys(data),
    datasets: [{
      backgroundColor: ['#2c3e50', '#3498db', '#e67e22', '#9b59b6', '#1abc9c', '#f1c40f'],
      borderWidth: 0, // Enlève les bordures pour un style plus "flat"
      data: Object.values(data)
    }]
  }
})

// Graphique 2 : Répartition des vulnérabilités par criticité
const vulnChartData = computed(() => {
  if (!riskStore.dashboardData || !riskStore.dashboardData.criticality_distribution) return null
  
  const data = riskStore.dashboardData.criticality_distribution
  // Mapping strict des couleurs selon le niveau de risque
  const colorMap = { 'faible': '#4caf50', 'moyenne': '#ff9800', 'élevée': '#f44336', 'critique': '#b71c1c' }
  const bgColors = Object.keys(data).map(key => colorMap[key] || '#95a5a6')

  return {
    labels: Object.keys(data).map(k => k.charAt(0).toUpperCase() + k.slice(1)), // Majuscule
    datasets: [{
      backgroundColor: bgColors,
      borderWidth: 0,
      data: Object.values(data)
    }]
  }
})
</script>

<template>
  <div class="container">
    <div class="header-actions">
      <h1>Tableau de bord de Sécurité</h1>
    </div>

    <div v-if="!appStore.currentCompanyId" class="empty-state">
      ⚠️ Veuillez sélectionner une entreprise dans l'Annuaire pour afficher ses statistiques.
    </div>

    <div v-else-if="riskStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Analyse des risques en cours...</p>
    </div>

    <div v-else-if="riskStore.dashboardData" class="dashboard-content">
      
      <section class="kpi-grid">
        <div class="kpi-card highlight">
          <h3>Score de Risque</h3>
          <div :class="['score-value', riskStore.dashboardData.risk_level]">
            {{ riskStore.dashboardData.risk_score }} <span class="max-score">/ 100</span>
          </div>
          <div :class="['risk-badge', riskStore.dashboardData.risk_level]">
            Niveau {{ riskStore.dashboardData.risk_level }}
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon">🖥️</div>
          <div class="kpi-info">
            <h3>Total Équipements</h3>
            <div class="kpi-value">{{ riskStore.dashboardData.total_assets }}</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon">🛡️</div>
          <div class="kpi-info">
            <h3>Failles Détectées</h3>
            <div class="kpi-value">{{ riskStore.dashboardData.total_vulnerabilities }}</div>
          </div>
        </div>
      </section>

      <section class="charts-grid">
        <div class="chart-card">
          <h3>Répartition de l'infrastructure</h3>
          <div class="chart-wrapper">
            <Doughnut v-if="assetChartData && riskStore.dashboardData.total_assets > 0" :data="assetChartData" :options="chartOptions" />
            <div v-else class="no-data">Aucun équipement enregistré</div>
          </div>
        </div>

        <div class="chart-card">
          <h3>Sévérité des menaces</h3>
          <div class="chart-wrapper">
            <Doughnut v-if="vulnChartData && riskStore.dashboardData.total_vulnerabilities > 0" :data="vulnChartData" :options="chartOptions" />
            <div v-else class="no-data">Aucune menace détectée</div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
.header-actions { margin-bottom: 2rem; }

/* Grille des indicateurs (KPIs) */
.kpi-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
.kpi-card { 
  background: white; border-radius: 12px; padding: 1.5rem; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #eee;
  display: flex; align-items: center; gap: 1.5rem;
}
.kpi-card.highlight { flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 0.5rem; }

.kpi-icon { font-size: 2.5rem; background: #f8f9fa; padding: 1rem; border-radius: 12px; }
.kpi-info h3 { margin: 0; font-size: 0.9rem; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
.kpi-value { font-size: 2rem; font-weight: bold; color: #2c3e50; margin-top: 0.5rem; }

/* Styles du Score de Risque */
.highlight h3 { margin: 0; font-size: 1rem; color: #555; text-transform: uppercase; letter-spacing: 1px; }
.score-value { font-size: 3.5rem; font-weight: 900; line-height: 1; }
.max-score { font-size: 1.5rem; color: #ccc; font-weight: normal; }

/* Couleurs dynamiques du risque */
.score-value.faible { color: #4caf50; }
.score-value.moyen { color: #ff9800; }
.score-value.élevé { color: #d32f2f; }

.risk-badge { padding: 0.4rem 1.2rem; border-radius: 20px; font-weight: bold; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-top: 0.5rem; }
.risk-badge.faible { background: #e8f5e9; color: #2e7d32; }
.risk-badge.moyen { background: #fff3e0; color: #e65100; }
.risk-badge.élevé { background: #ffebee; color: #c62828; }

/* Grille des graphiques */
.charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.chart-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #eee; }
.chart-card h3 { margin: 0 0 1.5rem 0; color: #2c3e50; font-size: 1.1rem; text-align: center; }

/* Wrapper crucial pour que Chart.js reste responsive */
.chart-wrapper { height: 300px; position: relative; display: flex; justify-content: center; align-items: center; }
.no-data { color: #999; font-style: italic; }

/* États vides et chargement */
.empty-state { text-align: center; padding: 3rem; color: #888; background: #fff3cd; border-radius: 12px; border: 1px solid #ffeeba; margin-top: 2rem; }
.loading-state { text-align: center; padding: 4rem; color: #666; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 1rem auto; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>