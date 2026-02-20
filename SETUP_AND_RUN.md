# Setup And Run Guide

This file explains exactly how to run the project from zero, including every `.env` field and where to get it.

## 1) How many `.env` files do you need?

You need **2 environment files**:

1. Root mobile env:
   - Path: `.env`
   - Based on: `.env.example`
   - Contains: **1 variable**
2. Backend env:
   - Path: `backend/.env`
   - Based on: `backend/.env.example`
   - Contains: **8 variables**

Total to fill: **9 variables**.

## 2) Create both env files

From the project root:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

## 3) Fill the root `.env` (mobile)

File: `.env`

```env
EXPO_PUBLIC_API_URL=http://localhost:8787
```

### Where this value comes from
- `EXPO_PUBLIC_API_URL`: the backend base URL your mobile app calls.
- If backend runs locally on port `8787`, keep `http://localhost:8787`.
- If backend is deployed, use its public URL (for example `https://api.yourdomain.com`).

## 4) Fill `backend/.env`

File: `backend/.env`

```env
PORT=8787
DATABASE_URL=postgres://postgres:postgres@localhost:5432/movie_app
BETTER_AUTH_SECRET=replace_with_a_long_random_secret
BETTER_AUTH_URL=http://localhost:8787
GOOGLE_CLIENT_ID=replace_with_google_client_id
GOOGLE_CLIENT_SECRET=replace_with_google_client_secret
TMDB_API_KEY=replace_with_tmdb_bearer_token
CORS_ORIGIN=http://localhost:8081
```

### Field-by-field explanation and where to get each value

1. `PORT`
- What: backend listening port.
- Local default: `8787`.

2. `DATABASE_URL`
- What: PostgreSQL connection string used by Drizzle/Express.
- Where to get it:
  - Local Postgres: build it yourself (example already provided).
  - Hosted Postgres (Neon, Supabase, Railway, Render, etc.): copy connection string from provider dashboard.

3. `BETTER_AUTH_SECRET`
- What: secret key for signing auth/session data.
- How to generate:
```bash
openssl rand -base64 32
```
- Paste output as the value.

4. `BETTER_AUTH_URL`
- What: public base URL of your backend auth server.
- Local default: `http://localhost:8787`.
- Must match where backend is reachable by clients.

5. `GOOGLE_CLIENT_ID`
6. `GOOGLE_CLIENT_SECRET`
- What: OAuth credentials for Google login.
- Where to get them:
  1. Go to Google Cloud Console.
  2. Create/select a project.
  3. Configure OAuth consent screen.
  4. Create OAuth 2.0 Client ID (Web application).
  5. Set:
     - Authorized JavaScript origin: `http://localhost:8787` (or your `BETTER_AUTH_URL`)
     - Authorized redirect URI: `http://localhost:8787/api/auth/callback/google`
       (or `${BETTER_AUTH_URL}/api/auth/callback/google`)
  6. Copy Client ID and Client Secret into env.

7. `TMDB_API_KEY`
- What: TMDB **v4 Read Access Token** (Bearer token), used by backend movie routes.
- Where to get it:
  1. Log in to TMDB.
  2. Go to account/project API settings.
  3. Copy the **API Read Access Token (v4 auth)**.
- Important: this is a bearer token, not the old v3 API key format.

8. `CORS_ORIGIN`
- What: allowed frontend origin(s) for browser CORS.
- Local default: `http://localhost:8081`.
- Multiple origins are allowed as comma-separated values:
```env
CORS_ORIGIN=http://localhost:8081,http://localhost:19006
```

## 5) Install dependencies

From project root:

```bash
npm install
npm --prefix backend install
```

## 6) Run database migration

```bash
npm --prefix backend run db:migrate
```

If tables do not exist yet, this creates the auth and app tables in PostgreSQL.

## 7) Start backend + mobile

```bash
npm run dev
```

This runs:
- backend on `http://localhost:8787`
- Expo mobile dev server

## 8) Quick checks

1. Health check:
```bash
curl http://localhost:8787/health
```
Expected response:
```json
{"status":"ok"}
```

2. In Expo, open app on simulator/device.

3. Test auth flow:
- Onboarding -> Login/Signup -> Tabs.

## 9) Common issues

1. `DATABASE_URL is required` or DB connection errors:
- Check `backend/.env` exists and URL is valid/reachable.

2. Google OAuth fails:
- Verify redirect URI exactly matches:
  - `http://localhost:8787/api/auth/callback/google`
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

3. Mobile cannot call backend:
- Check root `.env` has correct `EXPO_PUBLIC_API_URL`.
- If testing on real device, `localhost` may not resolve to your computer. Use LAN IP (example `http://192.168.x.x:8787`).
