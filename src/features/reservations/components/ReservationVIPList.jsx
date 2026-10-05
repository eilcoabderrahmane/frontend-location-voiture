import React, { useState, useEffect } from 'react';
import { getReservationsVIP, getReservations } from '../services/reservationService';
import ConfirmVIPModal from './ConfirmVIPModal';

function ReservationVIPList() {
  const [reservations, setReservations] = useState([]);
  const [confirmedReservations, setConfirmedReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Vue / Onglet actif : 'pending' = Pré-réservations VIP, 'confirmed' = Réservations définitives
  const [activeTab, setActiveTab] = useState('pending');

  // Pré-réservation VIP sélectionnée pour confirmation
  const [selectedReservation, setSelectedReservation] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [vipData, allConfirmed] = await Promise.all([
        getReservationsVIP().catch(() => []),
        getReservations().catch(() => [])
      ]);

      // Récupérer les identifiants confirmés depuis le localStorage pour synchronisation immédiate
      let localConfirmedIds = [];
      try {
        localConfirmedIds = JSON.parse(localStorage.getItem('confirmed_vip_ids') || '[]');
      } catch {
        localConfirmedIds = [];
      }

      // Marquer le statut de chaque pré-réservation
      const processedVip = (vipData || []).map((res) => {
        const isConfirmed =
          res.statut === 'confirmee' ||
          localConfirmedIds.includes(res._id) ||
          allConfirmed.some((c) => c.pre_reservation_id === res._id);

        return {
          ...res,
          statut: isConfirmed ? 'confirmee' : (res.statut || 'en_attente')
        };
      });

      setReservations(processedVip);
      setConfirmedReservations(allConfirmed || []);
    } catch (err) {
      setError(err.message || 'Impossible de charger les réservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmationSuccess = (definitiveReservation) => {
    setSelectedReservation(null);
    setSuccessMessage(
      `🎉 Pré-réservation VIP confirmée avec succès ! Réservation définitive enregistrée sous la référence ${definitiveReservation.reference}.`
    );

    // Mettre à jour l'état local immédiatement
    setReservations((prev) =>
      prev.map((r) =>
        r._id === definitiveReservation.pre_reservation_id
          ? { ...r, statut: 'confirmee' }
          : r
      )
    );

    setConfirmedReservations((prev) => [definitiveReservation, ...prev]);
    // Basculer vers l'onglet des réservations confirmées pour afficher la nouvelle réservation (Critère 5)
    setActiveTab('confirmed');
  };

  const pendingList = reservations.filter((r) => r.statut !== 'confirmee');
  const confirmedList = reservations.filter((r) => r.statut === 'confirmee');

  return (
    <section className="bg-slate-800/40 rounded-2xl p-4 sm:p-6 border border-slate-700/60 space-y-6">
      
      {/* En-tête et statistiques */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>⭐</span>
            <span>Gestion des Pré-réservations &amp; Réservations VIP</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Consultez, sélectionnez et confirmez les pré-réservations pour les transformer en réservations définitives.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="text-xs px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
        >
          <span>🔄</span>
          <span>Actualiser</span>
        </button>
      </div>

      {/* Message de succès */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-xs text-emerald-400 hover:text-white underline ml-4 cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Onglets de navigation */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'pending'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>⏳ Pré-réservations en attente</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {pendingList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('confirmed')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'confirmed'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>📋 Réservations définitives</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700">
            {confirmedReservations.length}
          </span>
        </button>
      </div>

      {/* Contenu de l'onglet : Pré-réservations en attente */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {loading
                ? 'Chargement...'
                : `${pendingList.length} pré-réservation${pendingList.length > 1 ? 's' : ''} VIP à traiter`}
            </span>
            <span className="text-[11px] text-indigo-300">
              💡 Sélectionnez une pré-réservation pour vérifier ses données et la confirmer.
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-slate-800/60 border border-slate-700/60 animate-pulse" />
              ))}
            </div>
          ) : pendingList.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-900/50 border border-slate-700/50">
              <span className="text-3xl">✨</span>
              <p className="text-sm font-medium text-slate-300 mt-2">Aucune pré-réservation VIP en attente</p>
              <p className="text-xs text-slate-500 mt-1">Toutes les pré-réservations ont été confirmées ou aucune demande n'a été soumise.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4">
              {pendingList.map((res) => {
                const vehicle = res.vehicule_reserve || {};
                const dateDebut = res.date_debut_reservation
                  ? new Date(res.date_debut_reservation).toLocaleDateString('fr-FR')
                  : 'Non spécifiée';

                const dateFinCalc = (() => {
                  if (!res.date_debut_reservation || !res.duree_reservation) return null;
                  const d = new Date(res.date_debut_reservation);
                  d.setDate(d.getDate() + Number(res.duree_reservation));
                  return d.toLocaleDateString('fr-FR');
                })();

                return (
                  <li
                    key={res._id}
                    className="rounded-xl bg-slate-900/80 border border-slate-700/70 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:border-indigo-500/60 transition shadow-lg"
                  >
                    {/* Informations Client & Dates */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-white">
                          ⭐ {res.prenom_client} {res.nom_client}
                        </span>
                        {/* Critère 2 : Affichage du Statut */}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          En attente de confirmation
                        </span>
                      </div>

                      {/* Critère 2 : Dates de location */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
                        <p>
                          📅 <strong className="text-slate-300">Début :</strong> {dateDebut}
                        </p>
                        <p>
                          ⏳ <strong className="text-slate-300">Durée :</strong> {res.duree_reservation} jour{res.duree_reservation > 1 ? 's' : ''}
                          {dateFinCalc && <span className="text-slate-500"> (fin : {dateFinCalc})</span>}
                        </p>
                        <p>
                          🕒 <strong className="text-slate-300">Date d'action :</strong>{' '}
                          {res.date_action ? new Date(res.date_action).toLocaleDateString('fr-FR') : 'Aujourd\'hui'}
                        </p>
                        {res.email_client && (
                          <p>
                            ✉️ <strong className="text-slate-300">Email :</strong> {res.email_client}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Critère 2 : Véhicule */}
                    <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3">
                      {vehicle.marque ? (
                        <div className="bg-indigo-950/40 border border-indigo-800/50 rounded-xl px-4 py-2.5 sm:text-right min-w-[200px]">
                          <p className="text-[11px] font-medium text-indigo-300">Véhicule pré-réservé</p>
                          <p className="text-sm font-bold text-white mt-0.5">
                            {vehicle.marque} {vehicle.modele}
                          </p>
                          <p className="text-xs font-mono text-indigo-400 mt-0.5">
                            {vehicle.immatriculation}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Véhicule non assigné</span>
                      )}

                      {/* Bouton de sélection et confirmation */}
                      <button
                        onClick={() => setSelectedReservation(res)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
                      >
                        <span>📝</span>
                        <span>Sélectionner &amp; Confirmer</span>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Contenu de l'onglet : Réservations définitives (Critère 5) */}
      {activeTab === 'confirmed' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {confirmedReservations.length} réservation{confirmedReservations.length > 1 ? 's' : ''} définitive{confirmedReservations.length > 1 ? 's' : ''} enregistrée{confirmedReservations.length > 1 ? 's' : ''}
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">
              ✅ Toutes ces réservations sont confirmées et validées.
            </span>
          </div>

          {confirmedReservations.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-900/50 border border-slate-700/50">
              <span className="text-3xl">📋</span>
              <p className="text-sm font-medium text-slate-300 mt-2">Aucune réservation définitive pour le moment</p>
              <p className="text-xs text-slate-500 mt-1">
                Confirmez une pré-réservation VIP ci-dessus pour la transformer en réservation définitive.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4">
              {confirmedReservations.map((res, index) => {
                const client = res.client || {};
                const vehicle = res.vehicule || {};
                const dateDebut = res.date_debut
                  ? new Date(res.date_debut).toLocaleDateString('fr-FR')
                  : 'N/A';
                const dateFin = res.date_fin
                  ? new Date(res.date_fin).toLocaleDateString('fr-FR')
                  : 'N/A';

                return (
                  <li
                    key={res._id || index}
                    className="rounded-xl bg-slate-900/80 border border-emerald-900/60 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-emerald-600/60 transition shadow-lg"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-white">
                          👤 {client.prenom || res.prenom_client} {client.nom || res.nom_client}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                          <span>✓</span>
                          Réservation définitive
                        </span>
                        {res.is_vip && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700">
                            VIP
                          </span>
                        )}
                        {res.reference && (
                          <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-indigo-300">
                            Réf : {res.reference}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
                        <p>
                          📅 <strong className="text-slate-300">Dates :</strong> Du {dateDebut} au {dateFin}
                        </p>
                        {client.email && (
                          <p>
                            ✉️ <strong className="text-slate-300">Email :</strong> {client.email}
                          </p>
                        )}
                        {client.telephone && (
                          <p>
                            📞 <strong className="text-slate-300">Tél :</strong> {client.telephone}
                          </p>
                        )}
                        {client.numero_permis && (
                          <p>
                            🪪 <strong className="text-slate-300">Permis :</strong> {client.numero_permis}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Véhicule associé */}
                    <div className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 sm:text-right min-w-[200px]">
                      <p className="text-[11px] font-medium text-slate-400">Véhicule réservé</p>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {vehicle.marque || 'Véhicule'} {vehicle.modele || ''}
                      </p>
                      <p className="text-xs font-mono text-emerald-400 mt-0.5">
                        {vehicle.immatriculation || 'Non spécifiée'}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Modale de Confirmation de la Pré-réservation VIP */}
      {selectedReservation && (
        <ConfirmVIPModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onSuccess={handleConfirmationSuccess}
        />
      )}
    </section>
  );
}

export default ReservationVIPList;
