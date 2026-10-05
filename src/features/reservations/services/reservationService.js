import { API_URL } from '../../../services/api';

/**
 * Pré-réserve un véhicule pour un client VIP (User Story : "Pré-réservation VIP")
 * @param {Object} reservationData
 * @param {string} reservationData.vehicule_reserve        ID du véhicule
 * @param {string} reservationData.nom_client
 * @param {string} reservationData.prenom_client
 * @param {number} reservationData.duree_reservation       Durée en jours
 * @param {string} reservationData.date_action             Date (YYYY-MM-DD)
 * @param {string} reservationData.date_debut_reservation  Date (YYYY-MM-DD)
 */
export async function createReservationVIP(reservationData) {
  let response;
  try {
    response = await fetch(`${API_URL}/rentals/vip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reservationData)
    });
  } catch {
    throw new Error('Impossible de joindre le serveur. Vérifiez que le backend est démarré.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `Erreur (${response.status})`);
    // Détail des erreurs de validation renvoyées par l'API (400)
    error.details = Array.isArray(data.errors) ? data.errors : [];
    throw error;
  }
  return data;
}

/**
 * Récupère la liste des pré-réservations VIP
 */
export async function getReservationsVIP() {
  const response = await fetch(`${API_URL}/rentals/vip`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Erreur lors du chargement des réservations (${response.status})`);
  }
  return data.data || [];
}

export async function getReservations() {
  const response = await fetch(`${API_URL}/reservations`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Erreur lors du chargement des réservations (${response.status})`);
  }
  return data.data || [];
}

export async function cancelReservation(reservationId) {
  const response = await fetch(`${API_URL}/reservations/${reservationId}/cancel`, {
    method: 'PATCH'
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Erreur lors de l'annulation (${response.status})`);
  }

  return data;
}

/**
 * Vérifie la disponibilité des véhicules entre deux dates
 * @param {string} start_date (YYYY-MM-DD)
 * @param {string} end_date (YYYY-MM-DD)
 */
export async function checkAvailability(start_date, end_date) {
  const response = await fetch(`${API_URL}/reservations/availability?start_date=${start_date}&end_date=${end_date}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Erreur de vérification (${response.status})`);
  }
  return data.data || [];
}

/**
 * Crée une réservation standard
 * @param {Object} reservationData 
 */
export async function createReservation(reservationData) {
  const response = await fetch(`${API_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reservationData)
  });
  
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Erreur lors de la réservation (${response.status})`);
  }
  return data;
}
