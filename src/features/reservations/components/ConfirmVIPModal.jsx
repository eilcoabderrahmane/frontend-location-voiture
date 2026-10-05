import React, { useState } from 'react';
import { confirmReservationVIP } from '../services/reservationService';

function ConfirmVIPModal({ reservation, onClose, onSuccess }) {
  const vehicle = reservation.vehicule_reserve || {};

  // Calcul initial de date de début et de fin
  const initialStartDate = reservation.date_debut_reservation
    ? new Date(reservation.date_debut_reservation).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const calculateEndDate = (start, duration) => {
    if (!start) return '';
    const d = new Date(start);
    d.setDate(d.getDate() + (Number(duration) || 1));
    return d.toISOString().split('T')[0];
  };

  const initialEndDate = calculateEndDate(initialStartDate, reservation.duree_reservation);

  const [formData, setFormData] = useState({
    nom: reservation.nom_client || '',
    prenom: reservation.prenom_client || '',
    email: reservation.email_client || '',
    telephone: reservation.telephone_client || '',
    adresse: reservation.adresse_client || '',
    numero_permis: reservation.numero_permis || '',
    date_debut: initialStartDate,
    date_fin: initialEndDate
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Critère d'acceptance : L’administrateur peut confirmer la pré-réservation que si toutes les informations sont saisies.
  const requiredFields = [
    { key: 'prenom', label: 'Prénom' },
    { key: 'nom', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'adresse', label: 'Adresse' },
    { key: 'numero_permis', label: 'N° de Permis' },
    { key: 'date_debut', label: 'Date de début' },
    { key: 'date_fin', label: 'Date de fin' }
  ];

  const missingFields = requiredFields.filter(f => !formData[f.key] || formData[f.key].trim() === '');
  const isFormComplete = missingFields.length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormComplete) {
      setError('Veuillez renseigner toutes les informations obligatoires avant de confirmer.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        vehicule: vehicle,
        client: {
          nom: formData.nom.trim(),
          prenom: formData.prenom.trim(),
          email: formData.email.trim(),
          telephone: formData.telephone.trim(),
          adresse: formData.adresse.trim(),
          numero_permis: formData.numero_permis.trim()
        },
        date_debut: formData.date_debut,
        date_fin: formData.date_fin,
        pre_reservation_id: reservation._id,
        statut: 'confirmee'
      };

      const result = await confirmReservationVIP(reservation._id, payload);
      onSuccess(result);
    } catch (err) {
      setError(err.message || 'Erreur lors de la confirmation définitive.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl my-8 p-6 shadow-2xl relative text-slate-100">
        
        {/* En-tête */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <h2 className="text-lg font-bold text-white">Confirmer la pré-réservation VIP</h2>
              <p className="text-xs text-indigo-400">Transformation en réservation définitive</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer text-lg"
          >
            ✕
          </button>
        </div>

        {/* Récapitulatif Véhicule & Pré-réservation */}
        <div className="my-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-slate-400 font-medium">Véhicule réservé :</p>
            <p className="text-white font-bold text-sm mt-0.5">
              {vehicle.marque || 'Véhicule'} {vehicle.modele || ''}
            </p>
            <p className="font-mono text-indigo-300">{vehicle.immatriculation || 'Non spécifiée'}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Statut actuel :</p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/60">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              Pré-réservation VIP (En attente)
            </span>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs">
            ⚠️ {error}
          </div>
        )}

        {/* Formulaire des informations requises */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-200 text-sm">Informations requises du client &amp; séjour</h3>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
              isFormComplete ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
            }`}>
              {requiredFields.length - missingFields.length} / {requiredFields.length} champs saisis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Prénom * {formData.prenom ? '✓' : ''}
              </label>
              <input
                type="text"
                name="prenom"
                required
                value={formData.prenom}
                onChange={handleChange}
                placeholder="Ex: Alexandre"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Nom * {formData.nom ? '✓' : ''}
              </label>
              <input
                type="text"
                name="nom"
                required
                value={formData.nom}
                onChange={handleChange}
                placeholder="Ex: Dupont"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Email * {formData.email ? '✓' : ''}
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Ex: alexandre.dupont@vip.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Téléphone * {formData.telephone ? '✓' : ''}
              </label>
              <input
                type="tel"
                name="telephone"
                required
                value={formData.telephone}
                onChange={handleChange}
                placeholder="Ex: 06 12 34 56 78"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Adresse postale * {formData.adresse ? '✓' : ''}
              </label>
              <input
                type="text"
                name="adresse"
                required
                value={formData.adresse}
                onChange={handleChange}
                placeholder="Ex: 12 avenue des Champs-Élysées, Paris"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                N° Permis de conduire * {formData.numero_permis ? '✓' : ''}
              </label>
              <input
                type="text"
                name="numero_permis"
                required
                value={formData.numero_permis}
                onChange={handleChange}
                placeholder="Ex: 14AA12345"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white uppercase focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Date de début *</label>
              <input
                type="date"
                name="date_debut"
                required
                value={formData.date_debut}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Date de fin *</label>
              <input
                type="date"
                name="date_fin"
                required
                min={formData.date_debut}
                value={formData.date_fin}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Bannière de validation si des champs sont manquants */}
          {!isFormComplete && (
            <div className="p-3 rounded-lg bg-amber-950/50 border border-amber-700/60 text-amber-200 text-xs">
              <span className="font-semibold">⚠️ Informations obligatoires manquantes pour confirmer :</span>
              <ul className="list-disc list-inside mt-1 grid grid-cols-2 gap-1 text-[11px] text-amber-300">
                {missingFields.map(f => (
                  <li key={f.key}>{f.label}</li>
                ))}
              </ul>
              <p className="mt-1 text-[11px] text-amber-400/90 italic">
                Conformément aux critères de validation, la confirmation ne peut être effectuée que si toutes les informations sont saisies.
              </p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!isFormComplete || submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition shadow-lg shadow-emerald-700/30 cursor-pointer"
              title={!isFormComplete ? 'Complétez toutes les informations pour débloquer la confirmation' : 'Confirmer et transformer en réservation définitive'}
            >
              {submitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Confirmation en cours...</span>
                </>
              ) : (
                <>
                  <span>✅</span>
                  <span>Confirmer la réservation définitive</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ConfirmVIPModal;
