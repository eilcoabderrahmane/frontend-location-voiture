/**
 * Configuration de l'API Backend.
 * Utilise strictement la variable d'environnement VITE_API_URL définie dans .env.
 * Si la variable est absente, une erreur explicite est levée sans valeur par défaut.
 */
const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error("La variable d'environnement VITE_API_URL est obligatoire dans le fichier .env du frontend.");
}

export const API_URL = apiUrl;
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default API_URL;
