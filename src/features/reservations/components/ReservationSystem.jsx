import React, { useState, useEffect } from 'react';
import { cancelReservation, checkAvailability, createReservation, getReservations } from '../services/reservationService';

function ReservationSystem() {
  const [dates, setDates] = useState({ start: '', end: '' });
  const [availableCars, setAvailableCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(false);
  const [searchError, setSearchError] = useState('');
  
  const [selectedCar, setSelectedCar] = useState(null);
  const [client, setClient] = useState({ nom: '', prenom: '', email: '', telephone: '', adresse: '' });
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationError, setReservationError] = useState('');
  const [reservationSuccess, setReservationSuccess] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [reservationNotice, setReservationNotice] = useState(null);

  const loadReservations = async () => {
    setReservationsLoading(true);
    try {
      const data = await getReservations();
      setReservations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setReservationsLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSelectedCar(null);
    setReservationSuccess(null);
    
    if (new Date(dates.end) <= new Date(dates.start)) {
      setSearchError('La date de fin doit être postérieure à la date de début.');
      return;
    }
    
    setLoadingCars(true);
    try {
      const cars = await checkAvailability(dates.start, dates.end);
      setAvailableCars(cars);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setLoadingCars(false);
    }
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    setReservationError('');
    setReservationLoading(true);
    
    try {
      const response = await createReservation({
        vehicule: selectedCar._id,
        client,
        date_debut: dates.start,
        date_fin: dates.end
      });
      setReservationSuccess(response.data);
      setReservationNotice(null);
      setReservations(prev => [response.data, ...prev]);
      // Retirer le véhicule de la liste
      setAvailableCars(prev => prev.filter(c => c._id !== selectedCar._id));
      setSelectedCar(null);
      setClient({ nom: '', prenom: '', email: '', telephone: '', adresse: '' });
    } catch (err) {
      setReservationError(err.message);
    } finally {
      setReservationLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    const confirmed = window.confirm('Voulez-vous vraiment annuler cette réservation ?');
    if (!confirmed) return;

    try {
      await cancelReservation(reservationId);
      setReservations(prev => prev.map(res =>
        res._id === reservationId ? { ...res, statut: 'Annulée' } : res
      ));
      setReservationNotice({ type: 'success', message: 'Réservation annulée avec succès.' });
    } catch (err) {
      setReservationNotice({ type: 'error', message: err.message || 'L’annulation a échoué.' });
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Formulaire de recherche */}
      <section className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/60">
        <h2 className="text-xl font-bold text-white mb-4">Rechercher un véhicule disponible</h2>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-slate-400 mb-1">Date de début</label>
            <input 
              type="date" 
              required
              min={new Date().toISOString().split('T')[0]}
              value={dates.start}
              onChange={e => setDates({ ...dates, start: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-slate-400 mb-1">Date de fin</label>
            <input 
              type="date" 
              required
              min={dates.start || new Date().toISOString().split('T')[0]}
              value={dates.end}
              onChange={e => setDates({ ...dates, end: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
            />
          </div>
          <button 
            type="submit" 
            disabled={loadingCars}
            className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-sm transition"
          >
            {loadingCars ? 'Recherche...' : 'Rechercher'}
          </button>
        </form>
        {searchError && <p className="mt-3 text-sm text-rose-400">{searchError}</p>}
      </section>

      {/* 2. Liste des véhicules disponibles */}
      {availableCars.length > 0 && !selectedCar && !reservationSuccess && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableCars.map(car => (
            <div key={car._id} className="bg-slate-900/70 border border-slate-700/60 rounded-xl p-4 flex flex-col gap-3 hover:border-indigo-500/50 transition">
              <div>
                <h3 className="font-bold text-white text-lg">{car.marque} {car.modele}</h3>
                <p className="text-xs text-indigo-400">{car.type_vehicule} • {car.type_carburant}</p>
              </div>
              <p className="text-sm text-slate-300 flex-1">Immatriculation: {car.immatriculation}</p>
              <button 
                onClick={() => setSelectedCar(car)}
                className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 py-2 rounded-lg text-sm font-medium transition"
              >
                Sélectionner ce véhicule
              </button>
            </div>
          ))}
        </section>
      )}

      {availableCars.length === 0 && dates.start && dates.end && !loadingCars && !searchError && !reservationSuccess && (
        <p className="text-center text-slate-400">Aucun véhicule disponible pour ces dates.</p>
      )}

      {/* Message de succès */}
      {reservationSuccess && (
        <div className="bg-emerald-950/60 border border-emerald-700/50 p-6 rounded-2xl text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-xl font-bold text-emerald-400 mb-2">Réservation confirmée !</h3>
          <p className="text-sm text-emerald-200">
            Votre réservation porte la référence : <strong className="text-white bg-emerald-900 px-2 py-1 rounded">{reservationSuccess.reference}</strong>
          </p>
          <button 
            onClick={() => { setReservationSuccess(null); setDates({ start: '', end: '' }); setAvailableCars([]); }}
            className="mt-6 text-sm text-emerald-300 underline"
          >
            Faire une nouvelle recherche
          </button>
        </div>
      )}

      {reservationNotice && (
        <div className={`p-3 rounded-lg border text-sm ${reservationNotice.type === 'success'
          ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
          : 'bg-rose-950/80 border-rose-700 text-rose-200'}`}>
          {reservationNotice.type === 'success' ? '✅' : '⚠️'} {reservationNotice.message}
        </div>
      )}

      <section className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/60">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-white">Réservations</h2>
          <button
            type="button"
            onClick={loadReservations}
            disabled={reservationsLoading}
            className="text-xs px-3 py-1 rounded-md bg-slate-900 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
          >
            {reservationsLoading ? 'Chargement...' : 'Actualiser'}
          </button>
        </div>

        {reservations.length === 0 ? (
          <p className="text-sm text-slate-400">Aucune réservation enregistrée pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {reservations.map((reservation) => (
              <div key={reservation._id} className="rounded-xl bg-slate-900/70 border border-slate-700/60 p-4 flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{reservation.reference}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${reservation.statut === 'Annulée'
                      ? 'bg-rose-950/80 border-rose-700 text-rose-200'
                      : 'bg-emerald-950/80 border-emerald-700 text-emerald-200'}`}>
                      {reservation.statut || 'Confirmée'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {reservation.client?.prenom} {reservation.client?.nom} • {new Date(reservation.date_debut).toLocaleDateString('fr-FR')} → {new Date(reservation.date_fin).toLocaleDateString('fr-FR')}
                  </p>
                  {reservation.vehicule && (
                    <p className="text-xs text-indigo-300 mt-1">
                      {reservation.vehicule.marque} {reservation.vehicule.modele} • {reservation.vehicule.immatriculation}
                    </p>
                  )}
                </div>
                {reservation.statut !== 'Annulée' && (
                  <button
                    type="button"
                    onClick={() => handleCancelReservation(reservation._id)}
                    className="text-xs px-3 py-1.5 rounded-md border border-rose-700 bg-rose-950/80 text-rose-200 hover:bg-rose-900 transition"
                  >
                    Annuler
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Formulaire de réservation */}
      {selectedCar && (
        <section className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/60">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Finaliser la réservation</h2>
              <p className="text-sm text-indigo-300">
                Véhicule choisi : {selectedCar.marque} {selectedCar.modele}
              </p>
            </div>
            <button 
              onClick={() => setSelectedCar(null)}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Changer de véhicule
            </button>
          </div>

          <form onSubmit={handleReserve} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Prénom</label>
                <input required type="text" value={client.prenom} onChange={e => setClient({...client, prenom: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nom</label>
                <input required type="text" value={client.nom} onChange={e => setClient({...client, nom: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                <input required type="email" value={client.email} onChange={e => setClient({...client, email: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Téléphone</label>
                <input required type="tel" value={client.telephone} onChange={e => setClient({...client, telephone: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">Adresse</label>
                <input required type="text" value={client.adresse} onChange={e => setClient({...client, adresse: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" />
              </div>
            </div>
            
            {reservationError && <p className="text-sm text-rose-400 mt-2">⚠️ {reservationError}</p>}
            
            <button 
              type="submit" 
              disabled={reservationLoading}
              className="w-full mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg transition disabled:opacity-50"
            >
              {reservationLoading ? 'Enregistrement...' : 'Confirmer la réservation'}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

export default ReservationSystem;
