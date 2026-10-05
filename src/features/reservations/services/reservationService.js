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
