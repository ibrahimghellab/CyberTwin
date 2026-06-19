// URL de base du serveur Node.js de ton binôme (à adapter selon son port)
const BASE_URL = 'http://localhost:3000/api'

export const api = {
  async getCompany() {
    const response = await fetch(`${BASE_URL}/company`) // [cite: 97]
    if (!response.ok) throw new Error('Erreur réseau')
    return response.json()
  },

  async getAssets() {
    const response = await fetch(`${BASE_URL}/assets`) // [cite: 98]
    if (!response.ok) throw new Error('Erreur réseau')
    return response.json()
  },

  async createAsset(assetData) {
    const response = await fetch(`${BASE_URL}/assets`, { // [cite: 99]
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetData)
    })
    return response.json()
  },

  // Tu pourras ajouter PUT /assets/:id et DELETE /assets/:id plus tard [cite: 100, 101]
}