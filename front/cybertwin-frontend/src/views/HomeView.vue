<template>
  <div class="home-container">
    <h1 class="home-title">CyberTwin</h1>
    <p class="home-text">
      Simulateur de Risque Cyber pour PME.
    </p>
    <router-link to="/entreprise" class="btn-primary home-cta">
      Démarrer l'évaluation
    </router-link>
  </div>
</template>

<style scoped>
.home-container { text-align: center; padding: 4rem 2rem; color: var(--text-color); }
.home-title { font-size: 2.5rem; color: var(--text-color); margin-bottom: 1rem; }
.home-text { font-size: 1.2rem; color: var(--text-muted); margin-bottom: 2rem; }
.home-cta { padding: 1rem 2rem; text-decoration: none; border-radius: 8px; display: inline-block; }
</style>