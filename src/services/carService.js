import { API_URL } from './api';

/**
 * Vérifie l'état de l'API Backend (/health)
 */
export async function checkHealth() {
  const response = await fetch(`${API_URL}/health`);
  if (!response.ok) {
    throw new Error(`Erreur lors du test de santé de l'API (${response.status})`);
  }
  return response.json();
}

/**
 * Récupère la liste des véhicules avec filtrage optionnel par marque.
 * @param {string} marque
 */
export async function getCars(marque = '') {
  const params = new URLSearchParams();
  if (marque) {
    params.append('marque', marque);
  }

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_URL}/cars${queryString}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Erreur (${response.status})`);
  }

  return data;
}

/**
 * Ajoute un nouveau véhicule (User Story : "Ajouter un véhicule")
 * @param {Object} carData
 */
export async function createCar(carData) {
  const response = await fetch(`${API_URL}/cars`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(carData)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || (data.errors && data.errors.join(', ')) || `Erreur (${response.status})`);
  }
  return data;
}

/**
 * Récupère la liste des véhicules
 */
export async function getCars() {
  const response = await fetch(`${API_URL}/cars`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Erreur lors du chargement des véhicules (${response.status})`);
  }
  return data.data || [];
}
