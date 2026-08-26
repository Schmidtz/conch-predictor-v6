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


## Shared database: Cloudflare D1

This version uses **Cloudflare D1 as the source of truth** for race history. Browser localStorage is only an offline fallback. Two PCs using the deployed site will see the same records after the D1 database is configured.

### One-time D1 setup

1. In Cloudflare Dashboard, open **Workers & Pages → D1 SQL database** (or **Storage & Databases → D1**).
2. Create a database named `conch-race-db`.
3. Copy its **Database ID**.
4. In `wrangler.toml`, replace `YOUR_DATABASE_ID` with that ID.
5. Initialize the table from this project folder:

```bash
npx wrangler d1 execute conch-race-db --remote --file=schema.sql
```

6. Deploy:

```bash
npm run cf:deploy
```

7. Test the shared API at `/api/health` and `/api/records`.

### Important

Do not create a separate local database on each PC. The website calls `/api/records`, and the Worker reads/writes the same D1 database. If the API is unavailable, the UI shows `OFFLINE / LOCAL` and keeps a browser cache so work is not immediately lost; those offline changes are not considered synchronized until they are successfully saved to D1.
