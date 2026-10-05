import { useState } from 'react';
import { createReservationVIP } from '../services/reservationService';

const today = () => new Date().toISOString().split('T')[0];

const inputClass =
  'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-60';

/**
 * Modale de pré-réservation d'un véhicule pour un client VIP (accès Admin)
 * @param {Object}   props.vehicle    Véhicule à pré-réserver
 * @param {Function} props.onClose    Fermeture de la modale
 * @param {Function} props.onSuccess  Callback appelé avec le message de succès de l'API
 */
function PreReservationModal({ vehicle, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nom_client: '',
    prenom_client: '',
    duree_reservation: 1,
    date_action: today(),
    date_debut_reservation: today()
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Date de fin calculée à titre indicatif
  const dateFin = (() => {
    const duree = Number(formData.duree_reservation);
    if (!formData.date_debut_reservation || !Number.isInteger(duree) || duree < 1) return null;
    const d = new Date(formData.date_debut_reservation);
    d.setDate(d.getDate() + duree);
    return d.toLocaleDateString('fr-FR');
  })();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'duree_reservation' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await createReservationVIP({
        ...formData,
        vehicule_reserve: vehicle._id,
        duree_reservation: Number(formData.duree_reservation)
      });
      onSuccess(result.message || 'Pré-réservation VIP enregistrée avec succès !');
    } catch (err) {
      setError({
        message: err.message || 'Erreur lors de la pré-réservation',
        details: err.details || []
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pre-reservation-title"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[95vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <div>
              <h3 id="pre-reservation-title" className="text-base font-bold text-white">
                Pré-réservation VIP
              </h3>
              <p className="text-xs text-slate-400">
                {vehicle.marque} {vehicle.modele} &bull;{' '}
                <span className="font-mono text-indigo-300">{vehicle.immatriculation}</span>
              </p>
            </div>
          </div>
          <button
            id="pre-reservation-close"
            onClick={onClose}
            disabled={submitting}
            className="text-slate-400 hover:text-white transition p-1 text-base cursor-pointer"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Erreur API */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/80 border border-rose-700 text-rose-200 text-xs space-y-1">
            <p className="font-medium">⚠️ {error.message}</p>
            {error.details.length > 0 && (
              <ul className="list-disc list-inside text-rose-300 space-y-0.5">
                {error.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <form id="pre-reservation-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
          <fieldset disabled={submitting} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="nom_client" className="block text-slate-300 font-medium mb-1">
                  Nom du client *
                </label>
                <input
                  id="nom_client"
                  type="text"
                  name="nom_client"
                  required
                  autoComplete="family-name"
                  placeholder="ex: Dupont"
                  value={formData.nom_client}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="prenom_client" className="block text-slate-300 font-medium mb-1">
                  Prénom du client *
                </label>
                <input
                  id="prenom_client"
                  type="text"
                  name="prenom_client"
                  required
                  autoComplete="given-name"
                  placeholder="ex: Jean"
                  value={formData.prenom_client}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="date_debut_reservation" className="block text-slate-300 font-medium mb-1">
                  Date de début *
                </label>
                <input
                  id="date_debut_reservation"
                  type="date"
                  name="date_debut_reservation"
                  required
                  min={formData.date_action || undefined}
                  value={formData.date_debut_reservation}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="duree_reservation" className="block text-slate-300 font-medium mb-1">
                  Durée (jours) *
                </label>
                <input
                  id="duree_reservation"
                  type="number"
                  name="duree_reservation"
                  min="1"
                  step="1"
                  required
                  placeholder="ex: 7"
                  value={formData.duree_reservation}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="date_action" className="block text-slate-300 font-medium mb-1">
                  Date d'action *
                </label>
                <input
                  id="date_action"
                  type="date"
                  name="date_action"
                  required
                  value={formData.date_action}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div className="flex items-end">
                <div className="w-full rounded-lg border border-indigo-800/60 bg-indigo-950/40 px-3 py-2 text-indigo-200">
                  <span className="text-slate-400">Fin prévue : </span>
                  <span className="font-semibold">{dateFin || '—'}</span>
                </div>
              </div>
            </div>
          </fieldset>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800 mt-4">
            <button
              id="pre-reservation-cancel"
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              id="pre-reservation-submit"
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium transition cursor-pointer flex items-center gap-1.5"
            >
              {submitting && (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {submitting ? 'Pré-réservation...' : 'Confirmer la pré-réservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PreReservationModal;
