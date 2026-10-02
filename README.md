# 🚗 Frontend — Location de Voitures

Frontend web de la plateforme de **location de voitures**, développé avec **React** et **Vite**.

L'application est conçue selon une architecture **Feature-Based** afin de séparer clairement les fonctionnalités métier et de faciliter la maintenance, l'évolution et la collaboration au sein de l'équipe.

---

## 📋 Table des matières

- [Présentation](#-présentation)
- [Technologies](#-technologies)
- [Architecture](#-architecture)
- [Identité visuelle](#-identité-visuelle)
- [Installation](#-installation)
- [Développement](#-développement)
- [Build de production](#-build-de-production)
- [Docker](#-docker)
- [CI/CD](#-cicd)
- [GitHub Packages](#-github-packages)
- [Structure du projet](#-structure-du-projet)
- [Scripts disponibles](#-scripts-disponibles)

---

## 📌 Présentation

Ce projet constitue la partie **Frontend** de la plateforme de location de voitures.

Il fournit une interface web moderne et responsive permettant d'interagir avec les différentes fonctionnalités de la plateforme.

Le projet repose sur :

- **React** pour la construction de l'interface utilisateur.
- **Vite** pour le développement et le build de l'application.
- **Tailwind CSS** pour le style et le design.
- Une architecture **Feature-Based** pour l'organisation du code.
- **Docker + Nginx** pour la conteneurisation et le déploiement.
- **GitHub Actions** pour l'intégration et la livraison continues.
- **GitHub Container Registry** pour stocker l'image Docker.

---

## 🛠️ Technologies

| Technologie | Utilisation |
|---|---|
| React | Interface utilisateur |
| Vite | Bundler et serveur de développement |
| JavaScript / JSX | Langage |
| Tailwind CSS | Styling |
| ESLint | Qualité et analyse du code |
| Docker | Conteneurisation |
| Nginx | Serveur des fichiers statiques |
| GitHub Actions | CI/CD |
| GitHub Container Registry | Stockage de l'image Docker |

---

# 🏗️ Architecture

Le projet utilise une architecture **Feature-Based**.

L'objectif est de regrouper les composants, pages, services et hooks appartenant à une même fonctionnalité dans un même espace.

```text
src/
│
├── assets/
│
├── components/
│   
├── features/
│   ├── cars/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── hooks/
│   │
│   ├── reservations/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── hooks/
│
├── layouts/
│
├── routes/
│
├── services/
│
├── hooks/
│
├── utils/
│
├── App.jsx
├── main.jsx
└── index.css
