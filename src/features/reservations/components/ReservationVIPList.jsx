import { useState, useEffect } from 'react';
import { getReservationsVIP } from '../services/reservationService';

function ReservationVIPList() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReservations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getReservationsVIP();
      setReservations(data);
    } catch (err) {
      setError(err.message || 'Impossible de charger les réservations VIP');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  return (
    <section className="bg-slate-800/40 rounded-2xl p-4 sm:p-6 border border-slate-700/60 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Pré-réservations VIP</h2>
          <p className="text-xs text-slate-400">
            {loading ? 'Chargement...' : `${reservations.length} réservation${reservations.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={loadReservations}
          disabled={loading}
          className="text-xs px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer disabled:opacity-50"
        >
          🔄 Actualiser
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-700 text-rose-200 text-sm">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-800/60 border border-slate-700/60 animate-pulse" />
          ))}
        </div>
      ) : !error && reservations.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">
          Aucune pré-réservation VIP pour le moment.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3">
          {reservations.map((res) => {
            const vehicle = res.vehicule_reserve;
            return (
              <li
                key={res._id}
                className="rounded-xl bg-slate-900/70 border border-slate-700/60 p-4 flex flex-col sm:flex-row justify-between gap-4 transition"
              >
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    ⭐ {res.prenom_client} {res.nom_client}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                    <p>Début : {new Date(res.date_debut_reservation).toLocaleDateString('fr-FR')} pour {res.duree_reservation} jours</p>
                    <p>Action : {new Date(res.date_action).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                {vehicle && (
                  <div className="bg-indigo-950/30 border border-indigo-900/50 rounded-lg p-3 sm:text-right min-w-[200px]">
                    <p className="text-xs font-medium text-indigo-300">Véhicule réservé</p>
                    <p className="text-sm font-bold text-white mt-1">
                      {vehicle.marque} {vehicle.modele}
                    </p>
                    <p className="text-xs font-mono text-indigo-400 mt-0.5">
                      {vehicle.immatriculation}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default ReservationVIPList;
