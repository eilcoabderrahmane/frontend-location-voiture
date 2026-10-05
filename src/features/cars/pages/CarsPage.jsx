import { useEffect, useMemo, useState } from 'react';
import { checkHealth, createCar, getCars } from '../services/carService';

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

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '—';
  return new Intl.NumberFormat('fr-FR').format(Number(value));
}

export default function CarsPage() {
  const [backendStatus, setBackendStatus] = useState({ loading: true, ok: false, message: '' });
  const [cars, setCars] = useState([]);
  const [brandFilter, setBrandFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(5);
  const [loadingCars, setLoadingCars] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const testConnection = async () => {
    setBackendStatus({ loading: true, ok: false, message: 'Test de connexion en cours...' });
    try {
      const data = await checkHealth();
      setBackendStatus({ loading: false, ok: true, message: data.message || 'API opérationnelle' });
    } catch (err) {
      setBackendStatus({
        loading: false,
        ok: false,
        message: err.message || 'Impossible de joindre le backend'
      });
    }
  };

  const loadCars = async (brand = brandFilter) => {
    setLoadingCars(true);
    setErrorMsg('');
    try {
      const data = await getCars(brand || '');
      setCars(data.data || []);
      setVisibleCount(5);
    } catch (err) {
      setErrorMsg(err.message || 'Erreur lors du chargement des véhicules');
      setCars([]);
      setVisibleCount(5);
    } finally {
      setLoadingCars(false);
    }
  };

  useEffect(() => {
    testConnection();
    loadCars('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadCars(brandFilter);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [brandFilter]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'kilometrage' || name === 'consommation' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleCreateCar = async (event) => {
    event.preventDefault();
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
      loadCars(brandFilter);
    } catch (err) {
      setErrorMsg(err.message || "Erreur lors de l'ajout du véhicule");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚗</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Location Voitures</h1>
              <p className="text-xs text-indigo-400 font-medium">Gestion de la flotte</p>
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
            >
              🔄 Re-tester
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
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

        <section className="bg-slate-900/80 rounded-2xl p-6 border border-slate-700/60">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-400 font-semibold">Flotte</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Liste des véhicules</h2>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="brand-filter" className="text-sm text-slate-300 whitespace-nowrap">Marque</label>
                <input
                  id="brand-filter"
                  type="text"
                  value={brandFilter}
                  onChange={(event) => {
                    setBrandFilter(event.target.value);
                    setVisibleCount(5);
                  }}
                  placeholder="Saisir une marque"
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 min-w-[180px]"
                />
              </div>
              <button
                onClick={() => {
                  setErrorMsg('');
                  setSuccessMsg('');
                  setShowAddModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition"
              >
                <span>➕</span>
                Ajouter
              </button>
            </div>
          </div>
        </section>

        <section className="bg-slate-900/80 rounded-2xl border border-slate-700/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead className="bg-slate-800 text-slate-300 uppercase tracking-wide text-[11px]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Marque</th>
                  <th className="px-4 py-3 font-semibold">Modèle</th>
                  <th className="px-4 py-3 font-semibold">Type véhicule</th>
                  <th className="px-4 py-3 font-semibold">Immatriculation</th>
                  <th className="px-4 py-3 font-semibold">Carburant</th>
                  <th className="px-4 py-3 font-semibold">Date insertion</th>
                  <th className="px-4 py-3 font-semibold">Date mise en service</th>
                  <th className="px-4 py-3 font-semibold">Kilométrage</th>
                  <th className="px-4 py-3 font-semibold">Consommation</th>
                </tr>
              </thead>
              <tbody>
                {loadingCars ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-10 text-center text-slate-400">
                      Chargement des véhicules...
                    </td>
                  </tr>
                ) : cars.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-10 text-center text-slate-400">
                      Aucun véhicule trouvé pour cette marque.
                    </td>
                  </tr>
                ) : (
                  cars.slice(0, visibleCount).map((car) => (
                    <tr key={car._id || car.immatriculation} className="border-t border-slate-800 hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3 font-medium text-white">{car.marque}</td>
                      <td className="px-4 py-3">{car.modele}</td>
                      <td className="px-4 py-3">{car.type_vehicule}</td>
                      <td className="px-4 py-3 font-mono text-indigo-300">{car.immatriculation}</td>
                      <td className="px-4 py-3">{car.type_carburant}</td>
                      <td className="px-4 py-3">{formatDate(car.date_insertion)}</td>
                      <td className="px-4 py-3">{formatDate(car.date_mise_en_service)}</td>
                      <td className="px-4 py-3">{formatNumber(car.kilometrage)} km</td>
                      <td className="px-4 py-3">{formatNumber(car.consommation)} L/100km</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {cars.length > visibleCount && !loadingCars && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/60">
              <button
                type="button"
                onClick={() => setVisibleCount((current) => Math.min(current + 5, cars.length))}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition"
              >
                Voir plus
              </button>
            </div>
          )}
        </section>

        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚗</span>
                  <h3 className="text-base font-bold text-white">Ajouter un nouveau véhicule</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition p-1 text-base cursor-pointer">
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
                    <label className="block text-slate-300 font-medium mb-1">Immatriculation *</label>
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
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
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
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
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
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium transition"
                  >
                    {submitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        Plateforme Location de Voitures &bull; EILCO ING2 Méthodes Agiles
      </footer>
    </div>
  );
}
