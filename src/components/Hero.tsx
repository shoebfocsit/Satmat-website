import { useEffect, useState } from 'react';
import { Play, ShieldCheck, Zap } from 'lucide-react';
import { api, WEBAPP_URL, type Market } from '../lib/api';
import { LIVE_POLL_MS, isTabVisible } from '../lib/live';

export function Hero() {
  const [market, setMarket] = useState<Market | null>(null);
  const [lucky, setLucky] = useState<{ ank: string; finalAnk: string } | null>(null);

  useEffect(() => {
    api.warmUp();
    let cancelled = false;
    const pick = (list: Market[]) => list.find((m) => m.isLive) ?? list[0] ?? null;
    api
      .markets()
      .then((list) => {
        if (!cancelled && list.length > 0) setMarket(pick(list));
      })
      .catch(() => {
        // Live card stays in its honest loading state — never fabricated.
      });
    api.luckyNumber().then((l) => { if (!cancelled && l) setLucky(l); }).catch(() => {});
    // Live sync: re-check every 5s so the hero card tracks declares.
    const id = setInterval(() => {
      if (!isTabVisible()) return;
      api
        .markets()
        .then((list) => {
          if (!cancelled && list.length > 0) setMarket(pick(list));
        })
        .catch(() => {});
      api.luckyNumber().then((l) => { if (!cancelled) setLucky(l); }).catch(() => {});
    }, LIVE_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const status = market ? (market.isLive ? 'OPEN NOW' : market.isClosed ? 'CLOSED' : 'UPCOMING') : null;
  const result = market && market.result && market.result !== '***-**-***' ? market.result : null;

  return (
    <section className="relative pt-32 pb-20 px-5 overflow-hidden">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#ffd900]/10 blur-3xl pointer-events-none" />
      <div className="absolute top-20 -right-40 w-[400px] h-[400px] rounded-full bg-[#ffd900]/5 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-[#a3a3a3] mb-8">
          <Zap size={14} className="text-[#ffd900]" />
          India&apos;s trusted Satta Matka platform
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
          Play Satta Matka
          <br />
          <span className="text-gradient-gold">Win Big, Withdraw Fast</span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-[#a3a3a3] text-base sm:text-lg leading-relaxed">
          Single Digit, Jodi, Panna, Sangam — every market you love, on one
          secure platform. Instant deposits, lightning-fast withdrawals, and
          24/7 support.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={WEBAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#ffd900] text-[#141414] font-bold px-8 py-4 rounded-xl hover:bg-[#ffe54d] transition-colors gold-glow"
          >
            <Play size={18} fill="currentColor" />
            Start Playing
          </a>
          <a
            href="#how-to-play"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ShieldCheck size={18} className="text-[#ffd900]" />
            How it Works
          </a>
        </div>

        <div className="mt-14 max-w-md mx-auto bg-[#1a1a1a]/80 backdrop-blur rounded-2xl p-5 card-border">
          {market ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-[#a3a3a3]">{market.name}</span>
                <span className="text-xs text-[#ffd900] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffd900] animate-pulse" />
                  {status}
                </span>
              </div>
              <div className="text-3xl font-black tracking-widest text-center">
                {result ? (
                  <span className="text-gradient-gold">{result}</span>
                ) : (
                  <span className="text-xs font-semibold text-[#a3a3a3] tracking-normal">
                    Today&apos;s result not declared yet — check back soon.
                  </span>
                )}
              </div>
              {lucky && (
                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-bold">
                  <span className="text-[#a3a3a3]">Lucky Ank:</span>
                  <span className="bg-[#ffd900] text-[#141414] px-2 py-0.5 rounded-full">{lucky.ank}</span>
                  <span className="bg-white/10 text-white px-2 py-0.5 rounded-full">Final {lucky.finalAnk}</span>
                </div>
              )}
              <div className="flex justify-center gap-8 mt-4 text-xs text-[#a3a3a3]">
                <span>
                  Opens <span className="text-white font-semibold">{market.openTime}</span>
                </span>
                <span>
                  Closes <span className="text-white font-semibold">{market.closeTime}</span>
                </span>
              </div>
            </>
          ) : (
            <p className="text-xs text-[#a3a3a3]">Loading live market…</p>
          )}
        </div>
      </div>
    </section>
  );
}
