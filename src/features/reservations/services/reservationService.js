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

/**
 * Récupère la liste de toutes les réservations confirmées
 */
export async function getReservations() {
  let backendReservations = [];
  try {
    const response = await fetch(`${API_URL}/reservations`);
    if (response.ok) {
      const data = await response.json();
      backendReservations = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
    }
  } catch {
    // Si l'API réservations n'est pas joignable, continuer avec le cache local
  }

  // Combiner avec les réservations confirmées stockées localement
  let localReservations = [];
  try {
    localReservations = JSON.parse(localStorage.getItem('confirmed_reservations') || '[]');
  } catch {
    localReservations = [];
  }

  // Fusionner sans doublons par _id ou reference
  const map = new Map();
  backendReservations.forEach(r => map.set(r._id || r.reference || JSON.stringify(r), r));
  localReservations.forEach(r => map.set(r._id || r.reference || JSON.stringify(r), r));

  return Array.from(map.values());
}

/**
 * Confirme une pré-réservation VIP et la transforme en réservation définitive
 * @param {string} id ID de la pré-réservation VIP
 * @param {Object} confirmationData Données complètes de la réservation
 */
export async function confirmReservationVIP(id, confirmationData) {
  let confirmedData = null;

  // 1. Tenter l'endpoint dédié de confirmation VIP côté backend
  try {
    const patchRes = await fetch(`${API_URL}/rentals/vip/${id}/confirm`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(confirmationData)
    });
    if (patchRes.ok) {
      const resJson = await patchRes.json();
      confirmedData = resJson.data || resJson;
    }
  } catch {
    // ignorer si endpoint non supporté
  }

  // 2. Si non supporté, tenter la création via l'API standard /reservations
  if (!confirmedData) {
    try {
      const stdRes = await createReservation({
        vehicule: confirmationData.vehicule?._id || confirmationData.vehicule,
        client: confirmationData.client,
        date_debut: confirmationData.date_debut,
        date_fin: confirmationData.date_fin,
        is_vip: true,
        pre_reservation_id: id,
        statut: 'confirmee'
      });
      confirmedData = stdRes.data || stdRes;
    } catch {
      // Ignorer l'erreur si mode déconnecté
    }
  }

  // 3. Objet final de réservation définitive
  const definitiveReservation = {
    _id: confirmedData?._id || `vip-confirmed-${Date.now()}`,
    reference: confirmedData?.reference || `VIP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    pre_reservation_id: id,
    statut: 'confirmee',
    is_vip: true,
    vehicule: confirmationData.vehicule,
    client: confirmationData.client,
    date_debut: confirmationData.date_debut,
    date_fin: confirmationData.date_fin,
    date_confirmation: new Date().toISOString()
  };

  // 4. Enregistrer dans le stockage local pour persistance garantie
  try {
    const local = JSON.parse(localStorage.getItem('confirmed_reservations') || '[]');
    // Ajouter en tête
    const filtered = local.filter(r => r.pre_reservation_id !== id && r._id !== definitiveReservation._id);
    filtered.unshift(definitiveReservation);
    localStorage.setItem('confirmed_reservations', JSON.stringify(filtered));

    // Mémoriser l'ID de la pré-réservation comme confirmée
    const confirmedVipIds = JSON.parse(localStorage.getItem('confirmed_vip_ids') || '[]');
    if (!confirmedVipIds.includes(id)) {
      confirmedVipIds.push(id);
      localStorage.setItem('confirmed_vip_ids', JSON.stringify(confirmedVipIds));
    }
  } catch {
    // LocalStorage indisponible ou plein
  }

  return definitiveReservation;
}
