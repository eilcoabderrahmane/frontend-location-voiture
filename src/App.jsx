import { useState, useEffect } from 'react';
import { checkHealth, createCar, getCars } from './services/carService';
import PreReservationModal from './features/reservations/components/PreReservationModal';
// Import ajouté depuis la branche main
import CarsPage from './features/cars/pages/CarsPage';

// Rôle Admin simulé : le système d'authentification/rôles n'existe pas encore.
const isAdmin = true; // TODO: relier au vrai système de rôles plus tard

function App() {
  const [backendStatus, setBackendStatus] = useState({ loading: true, ok: false, message: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Liste des véhicules + pré-réservation VIP
  const [cars, setCars] = useState([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [carsError, setCarsError] = useState('');
  const [vehicleToReserve, setVehicleToReserve] = useState(null);

  // Formulaire d'ajout de véhicule (User Story : Ajouter un véhicule)
  const initialForm = {
    marque: '',
    modele: '',
    type_vehicule: 'voiture',
    immatriculation: '',
    type_carburant: 'hybride',
    date_mise_en_service: new Date().toISOString().split('T')[0],
    kilometrage: '',
    consommation: ''
  };

  const [formData, setFormData] = useState(initialForm);

  // Vérifier la connexion avec le Backend via .env
  const fetchHealth = () =>
    checkHealth()
      .then((data) => setBackendStatus({ loading: false, ok: true, message: data.message || 'API opérationnelle' }))
      .catch((err) =>
        setBackendStatus({
          loading: false,
          ok: false,
          message: err.message || 'Impossible de joindre le backend'
        })
      );

  const testConnection = () => {
    setBackendStatus({ loading: true, ok: false, message: 'Test de connexion en cours...' });
    fetchHealth();
  };

  // Charger la liste des véhicules
  const fetchCars = () =>
    getCars()
      .then((res) => setCars(res.data || res || []))
      .catch((err) => setCarsError(err.message || 'Impossible de charger les véhicules'))
      .finally(() => setCarsLoading(false));

  const loadCars = () => {
    setCarsLoading(true);
    setCarsError('');
    fetchCars();
  };

  useEffect(() => {
    fetchHealth();
    fetchCars();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'kilometrage' || name === 'consommation' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleCreateCar = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        kilometrage: Number(formData.kilometrage),
        consommation: Number(formData.consommation)
      };

      const result = await createCar(payload);
      setSuccessMsg(result.message || 'Véhicule ajouté avec succès dans la base de données !');
      setFormData(initialForm);
      setShowAddModal(false);
      loadCars();
    } catch (err) {
      setErrorMsg(err.message || "Erreur lors de l'ajout du véhicule");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* En-tête */}
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚗</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Location Voitures</h1>
              <p className="text-xs text-indigo-400 font-medium">Gestion de la flotte &amp; pré-réservations VIP</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                backendStatus.ok
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                  : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${backendStatus.ok ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}
              />
              {backendStatus.loading
                ? 'Connexion...'
                : backendStatus.ok
                ? 'Backend Connecté'
                : 'Backend Hors Ligne'}
            </span>
            <button
              onClick={testConnection}
              className="text-xs px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Tester la connexion API"
            >
              🔄 Re-tester
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6">

        {/* Messages de statut */}
        {errorMsg && (
          <div className="p-4 rounded-lg bg-rose-950/80 border border-rose-700 text-rose-200 text-sm flex justify-between items-center">
            <span>⚠️ {errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="text-xs underline text-rose-300">Fermer</button>
          </div>
        )}
        {successMsg && (
          <div className="p-4 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-sm flex justify-between items-center">
            <span>✅ {successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="text-xs underline text-emerald-300">Fermer</button>
          </div>
        )}

        {/* Section Action : Ajouter un Véhicule */}
        <section className="bg-slate-800/40 rounded-2xl p-8 border border-slate-700/60 text-center space-y-6">
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-16 h-16 bg-indigo-950/70 border border-indigo-700/50 text-indigo-400 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-inner">
              🚙
            </div>
            <h2 className="text-xl font-bold text-white">Ajouter un Véhicule</h2>
            <p className="text-sm text-slate-400">
              Enregistrez un nouveau véhicule dans le système via l'API backend reliée à MongoDB.
            </p>
          </div>

          <div>
            <button
              onClick={() => {
                setErrorMsg('');
                setSuccessMsg('');
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span className="text-lg">➕</span>
              <span>Ajouter un Véhicule</span>
            </button>
          </div>
        </section>

        {/* Section Liste : Flotte de véhicules de la branche feature */}
        <section id="fleet-section" className="bg-slate-800/40 rounded-2xl p-4 sm:p-6 border border-slate-700/60 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Flotte de véhicules (Vue VIP)</h2>
              <p className="text-xs text-slate-400">
                {carsLoading ? 'Chargement...' : `${cars.length} véhicule${cars.length > 1 ? 's' : ''} enregistré${cars.length > 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-950/70 text-amber-300 border border-amber-700/60">
                  🛡️ Mode Admin
                </span>
              )}
              <button
                id="fleet-refresh"
                onClick={loadCars}
                disabled={carsLoading}
                className="text-xs px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer disabled:opacity-50"
              >
                🔄 Actualiser
              </button>
            </div>
          </div>

          {carsError && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-700 text-rose-200 text-sm">
              ⚠️ {carsError}
            </div>
          )}

          {carsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-slate-800/60 border border-slate-700/60 animate-pulse" />
              ))}
            </div>
          ) : !carsError && cars.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              Aucun véhicule enregistré pour le moment.
            </p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cars.map((car) => (
                <li
                  key={car._id}
                  className="group rounded-xl bg-slate-900/70 border border-slate-700/60 hover:border-indigo-600/60 p-4 flex flex-col gap-3 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-950/70 border border-indigo-700/50 rounded-xl flex items-center justify-center text-xl">
                        {car.type_vehicule === 'van' ? '🚐' : '🚗'}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          {car.marque} {car.modele}
                        </h3>
                        <p className="text-xs font-mono text-indigo-300">{car.immatriculation}</p>
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 capitalize">
                      {car.type_carburant}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span>📍 {Number(car.kilometrage).toLocaleString('fr-FR')} km</span>
                    <span>⛽ {car.consommation} L/100km</span>
                  </div>

                  {isAdmin && (
                    <button
                      id={`pre-reserver-${car._id}`}
                      onClick={() => {
                        setErrorMsg('');
                        setSuccessMsg('');
                        setVehicleToReserve(car);
                      }}
                      className="mt-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <span>⭐</span>
                      <span>Pré-réserver</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Section CarsPage issue de la branche Main */}
        <section className="mt-8 pt-8 border-t border-slate-800">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white">Interface Principale (CarsPage)</h2>
            <p className="text-xs text-slate-400">Composant récupéré depuis la branche main.</p>
          </div>
          <div className="bg-slate-900 rounded-2xl border border-slate-700/60 overflow-hidden">
            <CarsPage />
          </div>
        </section>

        {/* Modal de pré-réservation VIP (Admin) */}
        {isAdmin && vehicleToReserve && (
          <PreReservationModal
            vehicle={vehicleToReserve}
            onClose={() => setVehicleToReserve(null)}
            onSuccess={(message) => {
              setVehicleToReserve(null);
              setSuccessMsg(message);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Modal d'ajout de véhicule */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚗</span>
                  <h3 className="text-base font-bold text-white">Ajouter un nouveau véhicule</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white transition p-1 text-base cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCar} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Marque *</label>
                    <input
                      type="text"
                      name="marque"
                      required
                      placeholder="ex: Renault"
                      value={formData.marque}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Modèle *</label>
                    <input
                      type="text"
                      name="modele"
                      required
                      placeholder="ex: Megane"
                      value={formData.modele}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Immatriculation * <span className="text-slate-400 font-normal">(ex: AB123CD)</span>
                    </label>
                    <input
                      type="text"
                      name="immatriculation"
                      required
                      placeholder="AB123CD"
                      value={formData.immatriculation}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white uppercase focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Type de véhicule *</label>
                    <select
                      name="type_vehicule"
                      value={formData.type_vehicule}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="voiture">Voiture</option>
                      <option value="van">Van</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Type de carburant *</label>
                    <select
                      name="type_carburant"
                      value={formData.type_carburant}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="essence">Essence</option>
                      <option value="hybride">Hybride</option>
                      <option value="diesel">Diesel</option>
                      <option value="électrique">Électrique</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Date mise en service *</label>
                    <input
                      type="date"
                      name="date_mise_en_service"
                      required
                      value={formData.date_mise_en_service}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Kilométrage (km) *</label>
                    <input
                      type="number"
                      name="kilometrage"
                      min="0"
                      required
                      placeholder="ex: 15000"
                      value={formData.kilometrage}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Consommation (L/100km) *</label>
                    <input
                      type="number"
                      name="consommation"
                      step="0.1"
                      min="0"
                      required
                      placeholder="ex: 5.4"
                      value={formData.consommation}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium transition cursor-pointer flex items-center gap-1.5"
                  >
                    {submitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Pied de page */}
      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        Plateforme Location de Voitures &bull; EILCO ING2 Méthodes Agiles
      </footer>
    </div>
  );
}

export default App;