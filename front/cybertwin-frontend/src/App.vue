<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Accueil</RouterLink> |
      <RouterLink to="/entreprise">Entreprise</RouterLink> |
      <RouterLink to="/actifs">Actifs</RouterLink> |
      <RouterLink to="/vulnerabilites">Vulnérabilités</RouterLink> |
      <RouterLink to="/dashboard">Tableau de bord</RouterLink> |
      <RouterLink to="/rapport">Rapport</RouterLink>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style>
/* Un peu de style basique pour tester */
nav {
  padding: 1rem;
  background-color: #f8f9fa;
  margin-bottom: 2rem;
}
nav a {
  margin: 0 10px;
  text-decoration: none;
  color: #2c3e50;
  font-weight: bold;
}
nav a.router-link-exact-active {
  color: #42b983; /* Couleur de lien actif (style Vue.js) */
}
</style>