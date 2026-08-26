# Conch Race Predictor — Cloudflare Free Deployment

This version is prepared for Cloudflare Workers + D1, so it can be deployed on the Workers Free plan without a credit card. Cloudflare's current Free plan provides 100,000 requests/day, but only 10 ms CPU time per invocation. Because a 50k–1M Monte Carlo simulation is too CPU-heavy for that limit, this build keeps the **historical database in shared Cloudflare D1** and runs the Monte Carlo calculation in the user's browser.

## 1. Create the D1 database

In the Cloudflare dashboard:

1. Open **Workers & Pages**.
2. Create/open the Workers project.
3. Go to **Storage & Databases → D1**.
4. Create a database named `conch-race-db`.
5. Copy the database ID.

## 2. Configure `wrangler.toml`

Replace:

```toml
database_id = "YOUR_DATABASE_ID"
```

with the D1 database ID.

## 3. Initialize the schema

From the project folder, run:

```bash
npx wrangler d1 execute conch-race-db --remote --file=schema.sql
```

## 4. Build and deploy

```bash
npm install
npm run cf:deploy
```

Cloudflare will print the public `workers.dev` URL.

## GitHub deployment

Cloudflare Workers can also connect to the GitHub repository for automatic deployments. Keep the repository root exactly as the project root:

```text
Dockerfile
package.json
worker.ts
wrangler.toml
schema.sql
src/
data/
```

The old Render `Dockerfile` and `render.yaml` are not used by Cloudflare Workers, but they can remain in the repository.

## Free-plan architecture

```text
Browser
  │
  ├── React/Vite UI
  ├── Monte Carlo (5k–100k)
  │
  ▼
Cloudflare Worker
  │
  └── API
       │
       ▼
     D1
       │
       └── Shared race history
```

If you later move to a paid Worker plan, `/api/predict` can be changed to run the Monte Carlo on the server.

---

# Conch Race Predictor V3 — Shared Online Database + Server Monte Carlo

This version turns the V2 prototype into a single web application with a shared server database and server-side prediction API.

## Architecture

**Website → Express API → shared race database → Bayesian/recency model → Monte Carlo → probabilities**

- React/Vite frontend
- Express backend
- Persistent JSON race database (`data/races.json`)
- Server-side prediction endpoint (`POST /api/predict`)
- Up to **1,000,000 Monte Carlo simulations** on the server
- Browser fallback capped at 100,000 simulations if the API is unavailable
- Existing historical database manager, lineup editor, live simulator and settings retained

## API

- `GET /api/health` — server/database status
- `GET /api/records` — shared race history
- `POST /api/records` — add a race
- `POST /api/records/bulk` — replace/import the database
- `DELETE /api/records/:id` — delete one race
- `DELETE /api/records` — clear all races
- `POST /api/predict` — calculate a prediction using the shared historical database

## Local development

Terminal 1:

```bash
npm install
npm run server:dev
```

Terminal 2:

```bash
npm run dev
```

The Vite development server proxies `/api` to `http://localhost:8787`.

For a production-style local test:

```bash
npm install
npm run build
npm start
```

Then open `http://localhost:8787`.

## Deploy as one website

The included `Dockerfile` and `render.yaml` are prepared for a persistent single-instance Render deployment. The persistent disk keeps `data/races.json` between deploys/restarts.

1. Put this folder in a GitHub repository.
2. Create a Render Web Service from the repository, or use the included `render.yaml` as a Blueprint.
3. Use `npm ci && npm run build` as the build command and `npm start` as the start command if configuring manually.
4. Keep the persistent disk mounted at the project's `data` directory.
5. Render will provide the HTTPS website address.

The app then has one shared database: race results entered from your PC or phone are available to every user of that deployed instance.

## Important production note

The included JSON database is intentionally simple so the project can run without a separate database account. For a larger multi-user deployment, replace `data/races.json` with PostgreSQL/Supabase. The API boundary is already separated so that migration can be done without redesigning the frontend.

## Prediction model

The model conditions the simulation on historical evidence **before** Monte Carlo runs:

1. Bayesian-smoothed win rate
2. Bayesian-smoothed Top-3 rate
3. Recency of recent finishes
4. Actual head-to-head finishing history
5. Historical performance under the selected emoticon
6. Current win count
7. Current popularity as a weak crowd signal
8. Current six-conch lineup
9. Per-run race variance and morale events

The output includes win probability, Top-2, Top-3, average rank, Exacta, Trifecta and head-to-head probabilities.

These are statistical estimates, not guarantees. Use the historical database and future backtesting to evaluate calibration and accuracy.


## V5 Shared Database + Manual Race Entry

This build includes an explicit **💾 Save Race to Shared Database** button. Open **Historical Race Database → Record New Race** to enter the six conches, their morale/emoticons, and explicitly select **Winner (1st)**, **2nd**, and **3rd** from the participating conches.

The save operation sends the record to `/api/records`, which stores it in Cloudflare D1. Other computers load the same records from `/api/records`. Monte Carlo simulation remains in the browser.

### D1 schema

The application expects `race_records(id, timestamp, payload)`. If an empty database currently has a different `race_records` schema, run `schema-reset-empty.sql` once remotely, then redeploy. Do not run it on a database containing records you want to keep.
