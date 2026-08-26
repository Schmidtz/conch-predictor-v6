import type { RaceRecord } from './src/types';

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  return new Response(JSON.stringify(data), { ...init, headers });
}

function makeId() {
  return `race_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}

async function getRecords(db: D1Database): Promise<RaceRecord[]> {
  const result = await db.prepare(
    'SELECT id, payload FROM race_records ORDER BY timestamp DESC'
  ).all<{ id: string; payload: string }>();
  return result.results.map((row) => JSON.parse(row.payload) as RaceRecord);
}

async function handleApi(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/api/health' && request.method === 'GET') {
    const count = await env.DB.prepare('SELECT COUNT(*) AS count FROM race_records').first<{ count: number }>();
    return json({
      ok: true,
      records: Number(count?.count || 0),
      database: 'Cloudflare D1',
      modelVersion: 'Shared D1 database → browser Monte Carlo v4',
    });
  }

  if (path === '/api/records' && request.method === 'GET') {
    return json({ records: await getRecords(env.DB) });
  }

  if (path === '/api/records' && request.method === 'POST') {
    const input = await request.json() as Omit<RaceRecord, 'id'>;
    if (!input || !Array.isArray(input.participants) || !input.winnerId) {
      return json({ error: 'Invalid race record.' }, { status: 400 });
    }
    const record: RaceRecord = { ...input, id: makeId() };
    await env.DB.prepare(
      'INSERT INTO race_records (id, timestamp, payload) VALUES (?, ?, ?)'
    ).bind(record.id, record.timestamp, JSON.stringify(record)).run();
    return json(record, { status: 201 });
  }

  if (path === '/api/records/bulk' && request.method === 'POST') {
    const body = await request.json() as { records?: RaceRecord[] };
    if (!Array.isArray(body.records)) return json({ error: 'records must be an array.' }, { status: 400 });
    const normalized = body.records.map((r) => ({ ...r, id: r.id || makeId() }));
    const statements = normalized.map((record) =>
      env.DB.prepare(
        'INSERT OR REPLACE INTO race_records (id, timestamp, payload) VALUES (?, ?, ?)'
      ).bind(record.id, record.timestamp, JSON.stringify(record))
    );
    if (statements.length) await env.DB.batch(statements);
    return json({ records: normalized });
  }

  if (path === '/api/records' && request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM race_records').run();
    return new Response(null, { status: 204 });
  }

  const match = path.match(/^\/api\/records\/([^/]+)$/);
  if (match && request.method === 'DELETE') {
    const id = decodeURIComponent(match[1]);
    const result = await env.DB.prepare('DELETE FROM race_records WHERE id = ?').bind(id).run();
    if (!result.meta.changes) return json({ error: 'Record not found.' }, { status: 404 });
    return new Response(null, { status: 204 });
  }

  // The free Cloudflare Workers plan gives each invocation only 10 ms of CPU time.
  // A 50k–1M Monte Carlo run is therefore intentionally performed in the browser.
  // This endpoint tells the frontend to use its local simulation engine while the
  // historical database remains shared in D1. A paid Worker can later enable
  // server-side Monte Carlo without changing the database/API shape.
  if (path === '/api/predict' && request.method === 'POST') {
    return json({
      error: 'SERVER_MONTE_CARLO_DISABLED_ON_FREE_PLAN',
      message: 'Use browser Monte Carlo with the shared D1 historical database.',
    }, { status: 503 });
  }

  return null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      if (new URL(request.url).pathname.startsWith('/api/')) {
        const response = await handleApi(request, env);
        if (response) return response;
      }
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error(error);
      return json({ error: 'Internal server error.' }, { status: 500 });
    }
  },
};
