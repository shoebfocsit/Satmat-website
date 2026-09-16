import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export function Stats() {
  const [stats, setStats] = useState<Array<{ value: string; label: string }> | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .stats()
      .then((s) => {
        if (cancelled) return;
        setStats([
          { value: s.activePlayers.toLocaleString('en-IN'), label: 'Active Players' },
          { value: `${s.liveMarkets}`, label: 'Live Markets' },
          { value: s.withdrawalTime, label: 'Withdrawal Time' },
          { value: s.supportHours, label: 'Customer Support' },
        ]);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats) {
    if (error) return null; // honest: no fabricated numbers when backend is down
    return (
      <section className="py-12 px-5">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#1a1a1a] rounded-2xl p-6 card-border animate-pulse">
              <div className="h-8 rounded bg-white/5" />
              <div className="mt-2 h-4 rounded bg-white/5" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-5">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-[#1a1a1a] rounded-2xl p-6 text-center card-border"
          >
            <div className="text-2xl sm:text-3xl font-black text-gradient-gold">
              {s.value}
            </div>
            <div className="mt-1 text-xs sm:text-sm text-[#a3a3a3]">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
