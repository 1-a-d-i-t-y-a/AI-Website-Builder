# AI Website Builder

An AI-assisted website builder with a React/Vite client and an Express/MongoDB
API. Users can generate and edit websites, preview published sites, sign in
with Google, and access billing and deployment integrations.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- A MongoDB connection
- Firebase project configuration for Google sign-in
- API credentials for the AI, billing, or deployment integrations you plan to use

## Getting started

1. Install dependencies from the project root and both applications:

   ```sh
   npm ci
   npm --prefix client ci
   npm --prefix server ci
   ```

2. Create local environment files from the checked-in templates:

   ```powershell
   Copy-Item client\.env.example client\.env
   Copy-Item server\.env.example server\.env
   ```

   Set the values in `client/.env` and `server/.env`. Do not commit those local
   files or put real credentials in the example templates.

3. Start the client and API together:

   ```sh
   npm run dev
   ```

   The Vite client runs at `http://localhost:5173`; the API defaults to
   `http://localhost:8000`.

## Environment variables

### Client (`client/.env`)

- `VITE_FIREBASE_API_KEY` — Firebase Web API key for the configured Firebase
  project.
- `VITE_API_URL` — optional API base URL. Defaults to the current hostname on
  port `8000`.

### Server (`server/.env`)

- `PORT` — optional API port (defaults to `8000`).
- `MONGODB_URL` — MongoDB connection string.
- `JWT_SECRET` — a long, random secret used to sign authentication tokens.
- `FRONTEND_URL` — client origin allowed by the API, for example
  `http://localhost:5173`.
- `GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`,
  `CLOUDFLARE_API`, `CLOUDFLARE_ACCOUNT_ID` — credentials for the AI providers
  you enable.
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` — optional Razorpay billing
  credentials.
- `VERCEL_TOKEN` — optional token for Vercel deployments.

## Useful commands

Run these from the project root:

```sh
npm run dev
npm run dev:client
npm run dev:server
npm --prefix client run build
npm --prefix client run lint
```

## Project layout

- `client/` — React application and Vite configuration.
- `server/` — Express API, MongoDB models, authentication, billing, and AI
  provider integrations.
