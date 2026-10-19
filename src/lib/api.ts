// Website API client — 100% live, marketing read-only.
//
// Same data contract as the webapp (web/src/lib/api.ts): every public
// endpoint (markets, results, charts, notices, game-rates, stats) is read
// straight from the backend. There are NO mock or sample fallbacks and NO
// stored snapshots — every call hits the network (simultaneous duplicates
// are coalesced in-flight). If the backend is down or empty the caller gets
// an error / empty state, never fabricated data.
//
// This site never touches authenticated endpoints (no wallet/bids/auth) —
// all trading happens in the webapp (see WEBAPP_URL).

const LIVE_BACKEND = 'https://api.satmat.cloud';

function resolveApiBase(raw: string | undefined): string {
  const base = (raw || '').trim().replace(/\/+$/, '');
  // Production: use same-origin proxy (vercel.json rewrites /api/v1 -> LIVE_BACKEND).
  // This keeps the backend origin out of the bundle and avoids CORS / mixed CSP.
  // Matches web/src/lib/api.ts which forces '/api/v1' in production.
  const isProd = typeof import.meta !== 'undefined' && (import.meta as any).env?.PROD;
  if (isProd) {
    // If VITE_API_BASE_URL explicitly points to a live backend in prod, honor it
    // (e.g. preview deploys). Otherwise force same-origin.
    if (base && /^https?:\/\//i.test(base) && !base.includes('localhost') && !base.includes('127.0.0.1')) {
      return /\/api\/v\d+$/i.test(base) ? base : `${base}/api/v1`;
    }
    return '/api/v1';
  }
  if (!base) return `${LIVE_BACKEND}/api/v1`;
  // Bare hostname without scheme (e.g. "api.satmat.cloud") -> assume https
  let withScheme = base;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(withScheme) && !withScheme.startsWith('/')) {
    withScheme = `https://${withScheme}`;
  }
  return /\/api\/v\d+$/i.test(withScheme) ? withScheme : `${withScheme}/api/v1`;
}

const API_BASE = resolveApiBase(import.meta.env.VITE_API_BASE_URL);

// All "Open App / Play Now" CTAs point here (override per deploy via env).
export const WEBAPP_URL = (
  import.meta.env.VITE_WEBAPP_URL ||
  'https://web-h3jw711gk-shashank-wagh-s-projects.vercel.app'
).replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

// Throttle console warnings for network failures to avoid flooding.
let hasWarnedNetwork = false;

async function request<T>(path: string, timeoutMs = 20000, _retry = true): Promise<T> {
  const url = `${API_BASE}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let res: Response;
    try {
      res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
    } catch (err: unknown) {
      const isAbort =
        (err instanceof DOMException && err.name === 'AbortError') ||
        (err instanceof Event && (err as { type?: string }).type === 'abort');
      if (isAbort) {
        // Cold-start on Render free tier can be 15-25s — retry once with longer timeout
        if (_retry && timeoutMs < 30000) {
          clearTimeout(timer);
          await new Promise((r) => setTimeout(r, 1500));
          return request<T>(path, 30000, false);
        }
        throw new ApiError(0, `Request timed out after ${timeoutMs}ms`);
      }
      // Retry once for transient network failures (cold start / wake)
      if (_retry) {
        clearTimeout(timer);
        await new Promise((r) => setTimeout(r, 1200));
        return request<T>(path, Math.min(30000, timeoutMs + 8000), false);
      }
      if (!hasWarnedNetwork) {
        hasWarnedNetwork = true;
        console.warn(
          `[api] Network error for ${path}: ${err instanceof Error ? err.message : String(err)}. Backend at ${API_BASE} may be unreachable.`,
        );
      }
      throw new ApiError(0, 'Unable to reach server. Please try again later.');
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Vercel SSO / Deployment Protection returns 200 HTML — fail loudly instead of empty screen
      const text = await res.text().catch(() => '');
      if (text.includes('vercel') || text.includes('<!DOCTYPE') || res.status === 200) {
        throw new ApiError(0, 'Site protection is blocking data. Please open the live URL or disable Deployment Protection.');
      }
      throw new ApiError(0, 'Server returned an unexpected response. Please try again later.');
    }
    if (!res.ok) {
      let message = `API ${res.status}`;
      try {
        const err = (await res.json()) as { error?: { message?: string } };
        if (err.error?.message) message = err.error.message;
      } catch {
        // ignore body parse errors
      }
      // 5xx often means cold start / transient — retry once
      if (_retry && res.status >= 500 && res.status < 600) {
        clearTimeout(timer);
        await new Promise((r) => setTimeout(r, 1500));
        return request<T>(path, timeoutMs, false);
      }
      throw new ApiError(res.status, message);
    }
    const data = (await res.json().catch(() => null)) as T | null;
    if (data === null || data === undefined) {
      throw new ApiError(0, 'Server returned an empty response. Please retry.');
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

// In-flight dedup only — never serves stored data.
const inflight = new Map<string, Promise<unknown>>();
function dedup<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const p = fetcher().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

export interface Market {
  id: string;
  name: string;
  result: string;
  openTime: string;
  closeTime: string;
  isLive: boolean;
  isClosed: boolean;
}

export interface GameRate {
  id: string;
  gameType: string;
  rateRange: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  isImportant?: boolean;
}

export interface Stats {
  activePlayers: number;
  liveMarkets: number;
  withdrawalTime: string;
  supportHours: string;
}

export interface LuckyNumber {
  date: string;
  ank: string;
  finalAnk: string;
  source: string;
}

export interface HowToPlaySection {
  title: string;
  body: string;
}

export interface GameType {
  id: string;
  title: string;
  iconName: string;
  isOpen: boolean;
  code?: string;
}

export interface AppConfig {
  minAppVersion: string;
  forceUpdate: boolean;
  banners: unknown[];
  supportContacts: Record<string, unknown>;
}

export interface ServerTime {
  iso: string;
}

export interface ChartResultRecord {
  date: string;
  jodi: string | null;
  panel: string | null;
  open: string | null;
  close: string | null;
  source: string;
}

export interface ChartRangeResponse {
  market: string;
  marketId: string;
  startDate: string;
  endDate: string;
  source: string;
  count: number;
  data: ChartResultRecord[];
  missingDates: string[];
}

export type ResultMarket = ResultsResponse['markets'][number];

export interface ResultsResponse {
  updatedAt: string;
  markets: Array<{
    id: string;
    name: string;
    highlight: boolean;
    openTime: string;
    closeTime: string;
    result: {
      jodi: string | null;
      panel: string | null;
      open?: string | null;
      close?: string | null;
      date: string;
      source: string;
    } | null;
  }>;
}

async function postJson<T>(path: string, body: unknown, timeoutMs = 10000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text().catch(() => '');
      throw new ApiError(0, text.slice(0, 200) || 'Unexpected response');
    }
    const data = (await res.json().catch(() => null)) as T | null;
    if (!res.ok) {
      const err = (data as any)?.error;
      throw new ApiError(res.status, err?.message || `API ${res.status}`);
    }
    if (data === null || data === undefined) throw new ApiError(0, 'Empty response');
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  markets: (): Promise<Market[]> => dedup('markets', () => request<Market[]>('/markets', 20000)),
  gameRates: (): Promise<GameRate[]> => dedup('gameRates', () => request<GameRate[]>('/game-rates', 20000)),
  notices: (): Promise<Notice[]> => dedup('notices', () => request<Notice[]>('/notices', 20000)),
  stats: (): Promise<Stats> => dedup('stats', () => request<Stats>('/stats', 20000)),
  howToPlay: (): Promise<{ sections: HowToPlaySection[] }> => dedup('howToPlay', () => request<{ sections: HowToPlaySection[] }>('/how-to-play', 10000)),
  luckyNumber: (): Promise<LuckyNumber | null> => dedup('lucky-number', () => request<LuckyNumber | null>('/lucky-number', 10000).catch(() => null as LuckyNumber | null)),
  gameTypes: (marketId?: string): Promise<GameType[]> => {
    const key = marketId ? `gameTypes:${marketId}` : 'gameTypes';
    const path = marketId ? `/game-types?market=${encodeURIComponent(marketId)}` : '/game-types';
    return dedup(key, () => request<GameType[]>(path, 10000));
  },
  serverTime: (): Promise<ServerTime> => dedup('server-time', () => request<ServerTime>('/server-time', 5000)),
  appConfig: (): Promise<AppConfig> => dedup('app-config', () => request<AppConfig>('/app-config', 5000)),
  subscribeNewsletter: (email: string): Promise<{ ok: boolean }> => postJson<{ ok: boolean }>('/newsletter/subscribe', { email }, 8000),
  ping: (timeoutMs = 5000): Promise<{ status?: string; iso?: string }> => request<{ status?: string; iso?: string }>('/health', timeoutMs).catch(() => request<{ iso: string }>('/server-time', timeoutMs)),
  warmUp: (): void => {
    if (typeof window === 'undefined') return;
    api.ping(4000).catch(() => {});
  },
  marketStatus: (marketId: string): Promise<{ status: string; canBid: boolean; serverTime: string }> => request(`/markets/${encodeURIComponent(marketId)}/status`, 8000),
};

export async function fetchResults(): Promise<{ data: ResultsResponse; offline: boolean }> {
  // LIVE-ONLY: always fetch fresh from the same backend the webapp uses
  // (https://api.satmat.cloud). On failure throw so callers
  // render an honest error — never a stale snapshot.
  const data = await dedup('results', () => request<ResultsResponse>('/results', 20000));
  return { data, offline: false };
}

export async function fetchChartRange(params: {
  market: string;
  startDate: string;
  endDate: string;
}): Promise<{ data: ChartRangeResponse; offline: boolean }> {
  // LIVE-ONLY: always fetch fresh. Timeout scales with range: full-history
  // pulls get up to 30s.
  const key = `charts:${params.market}:${params.startDate}:${params.endDate}`;
  const q = new URLSearchParams(params).toString();
  const days = Math.max(
    0,
    Math.round(
      (Date.parse(`${params.endDate}T00:00:00Z`) - Date.parse(`${params.startDate}T00:00:00Z`)) / 86400000,
    ),
  );
  const timeoutMs = Math.min(30000, 8000 + (Number.isFinite(days) ? days : 0) * 8);
  const data = await dedup(key, () => request<ChartRangeResponse>(`/charts?${q}`, timeoutMs));
  return { data, offline: false };
}

export { API_BASE };
