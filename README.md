# Movio (Movie App)

Movio est une application mobile Expo (React Native + TypeScript) connectee a un backend Express, PostgreSQL, Drizzle et BetterAuth.
L’app permet de decouvrir des films, de les sauvegarder en favoris, de marquer les films vus et de gerer un profil utilisateur.

Guide complet de demarrage: `SETUP_AND_RUN.md`

## Apercu
- Mobile: Expo Router + NativeWind
- Backend: Express TypeScript + BetterAuth + Drizzle + PostgreSQL
- Source des films: TMDB (via backend)

## Fonctionnalites
- Onboarding de demarrage
- Authentification:
  - Email / mot de passe
  - OAuth Google
- Films:
  - Discover (popular)
  - Recherche
  - Details
  - Trending base sur les recherches
- Saved:
  - Favoris
  - Watched (uniquement pour les favoris)
  - Defavoriser
- Profil:
  - Infos utilisateur
  - Logout

## Architecture du projet
- `app/`: ecrans Expo Router
- `components/`: composants reutilisables
- `services/`: appels API mobile
- `backend/`: API Express + Drizzle + BetterAuth

## Demarrage rapide
1. Installer les dependances:
```bash
npm install
npm --prefix backend install
```

2. Configurer les variables d’environnement:
- `.env` (mobile)
- `backend/.env` (backend)

Voir `SETUP_AND_RUN.md` pour les valeurs exactes et ou les recuperer.

3. Appliquer les migrations:
```bash
npm --prefix backend run db:migrate
```

4. Lancer tout le projet:
```bash
npm run dev
```

## Endpoints principaux (backend)
- `GET /health`
- `GET /api/movies/discover`
- `GET /api/movies/search?q=...`
- `GET /api/movies/:id`
- `GET /api/movies/trending`
- `GET /api/me`
- `GET /api/me/saved?tab=favorites|watched`
- `POST /api/me/saved`
- `PATCH /api/me/saved/:tmdbMovieId/watched`
- `DELETE /api/me/saved/:tmdbMovieId`
- `ALL /api/auth/*`

## Notes
- Toute la logique (auth, saved, trending, TMDB) passe par le backend.
- Le mobile n’appelle plus directement TMDB ou Appwrite.
