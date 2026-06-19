<script setup>
import { useCompanyStore } from '../stores/companyStore'

// On récupère notre store Pinia
const companyStore = useCompanyStore()

// Fonction déclenchée à la soumission du formulaire
const saveCompany = () => {
  // Pour l'instant, on se contente de mettre à jour le store localement.
  // Plus tard, on appellera companyStore.updateCompany() pour envoyer à l'API Node.
  console.log('Entreprise sauvegardée dans le store :', companyStore.companyInfo)
  alert('Les informations de l\'entreprise ont bien été enregistrées !')
}
</script>

<template>
  <div class="company-container">
    <header class="page-header">
      <h1>Profil de l'Entreprise</h1>
      <p>Définissez les caractéristiques de la PME pour évaluer son exposition au risque cyber.</p>
    </header>

    <form @submit.prevent="saveCompany" class="company-form">
      <fieldset>
        <legend>Informations générales</legend>
        
        <div class="form-group">
          <label for="name">Nom de l'entreprise</label>
          <input id="name" v-model="companyStore.companyInfo.name" type="text" placeholder="Ex: TechCorp" required />
        </div>

        <div class="form-group">
          <label for="sector">Secteur d'activité</label>
          <input id="sector" v-model="companyStore.companyInfo.sector" type="text" placeholder="Ex: E-commerce, Santé..." required />
        </div>
      </fieldset>

      <fieldset>
        <legend>Infrastructure informatique</legend>
        
        <div class="form-grid">
          <div class="form-group">
            <label for="employees">Nombre d'employés</label>
            <input id="employees" v-model="companyStore.companyInfo.employeesCount" type="number" min="1" required />
          </div>

          <div class="form-group">
            <label for="clients">Nombre de postes clients</label>
            <input id="clients" v-model="companyStore.companyInfo.clientsCount" type="number" min="0" required />
          </div>

          <div class="form-group">
            <label for="servers">Nombre de serveurs</label>
            <input id="servers" v-model="companyStore.companyInfo.serversCount" type="number" min="0" required />
          </div>

          <div class="form-group">
            <label for="services">Services exposés sur Internet</label>
            <input id="services" v-model="companyStore.companyInfo.exposedServices" type="number" min="0" required />
          </div>
        </div>
      </fieldset>

      <button type="submit" class="btn-primary">Sauvegarder le profil</button>
    </form>
  </div>
</template>

<style scoped>
.company-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 1rem;
}

fieldset {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background-color: #fcfcfc;
}

legend {
  font-weight: bold;
  color: #2c3e50;
  background: white;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

input {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.btn-primary {
  background-color: #42b983;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #33a06f;
}
</style>