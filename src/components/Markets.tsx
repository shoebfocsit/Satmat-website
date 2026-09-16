import { useEffect, useState } from 'react';
import { api, WEBAPP_URL, type Market } from '../lib/api';
import { LIVE_POLL_MS, isTabVisible } from '../lib/live';

type DisplayMarket = {
  name: string;
  open: string;
  close: string;
  status: string;
  live: boolean;
  result: string;
};

/** Middle (jodi) leg of an "open-jodi-close" result, or null when pending. */
function resultJodi(result: string): string | null {
  const m = /^\d{3}-(\d{2})-\d{3}$/.exec((result || '').trim());
  return m ? m[1] : null;
}

export function Markets() {
  const [markets, setMarkets] = useState<DisplayMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const apply = (list: Market[]) =>
      list.map((m) => ({
        name: m.name,
        open: m.openTime,
        close: m.closeTime,
        status: m.isLive ? 'LIVE' : m.isClosed ? 'CLOSED' : 'OPEN',
        live: !!m.isLive,
        result: m.result || '***-**-***',
      }));
    api.markets()
      .then((list) => {
        if (cancelled) return;
        setMarkets(list.length > 0 ? apply(list) : []);
        setError(null);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load markets');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    // Live sync: silent re-check every 5s so cards track declares.
    const id = setInterval(() => {
      if (!isTabVisible()) return;
      api.markets()
        .then((list) => {
          if (cancelled) return;
          setMarkets(list.length > 0 ? apply(list) : []);
          setError(null);
        })
        .catch(() => {});
    }, LIVE_POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return (
    <section id="markets" className="py-20 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black">
            Today's <span className="text-gradient-gold">Markets</span>
          </h2>
          <p className="mt-3 text-[#a3a3a3] max-w-xl mx-auto">
            All markets are open daily with fixed timings. Set a reminder and
            never miss a round.
          </p>
          {loading && <p className="mt-4 text-xs text-[#a3a3a3] text-center">Loading live markets…</p>}
          {error && <p className="mt-2 text-xs font-semibold text-[#fca5a5]">Live markets unavailable: {error}</p>}
          {!loading && !error && markets.length === 0 && (
            <p className="mt-2 text-xs text-[#a3a3a3]">No markets available right now.</p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {markets.map((m) => (
            <div
              key={m.name}
              className="bg-[#1a1a1a] rounded-2xl p-6 card-border hover:border-[#ffd900]/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold tracking-wide text-sm">{m.name}</h3>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                    m.live
                      ? 'bg-[#ffd900]/15 text-[#ffd900]'
                      : 'bg-white/5 text-[#a3a3a3]'
                  }`}
                >
                  {m.status}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-[#a3a3a3]">
                  Open <span className="text-white font-semibold">{m.open}</span>
                </span>
                <span className="text-[#a3a3a3]">
                  Close{' '}
                  <span className="text-white font-semibold">{m.close}</span>
                </span>
              </div>
              {/* Live declared result — same realtime feed as the webapp cards. */}
              <div className="mt-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-[#a3a3a3] tracking-widest">
                  RESULT
                </span>
                {(() => {
                  const jodi = resultJodi(m.result);
                  return jodi ? (
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-black font-mono text-white truncate">{m.result}</span>
                      <span className="shrink-0 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#ffd900] text-[#141414]">
                        {jodi}
                      </span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-[#a3a3a3]">
                      Awaiting declare
                    </span>
                  );
                })()}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <a
                  href="#charts"
                  className="text-center text-[11px] font-bold py-2 rounded-lg border border-white/10 text-[#a3a3a3] hover:border-[#ffd900]/40 hover:text-[#ffd900] transition-colors"
                >
                  CHART
                </a>
                <a
                  href={WEBAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-center text-[11px] font-black py-2 rounded-lg bg-[#ffd900] text-[#141414] hover:bg-[#ffe54d] transition-colors"
                >
                  PLAY NOW
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
