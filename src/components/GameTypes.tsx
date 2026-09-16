import { useEffect, useState } from 'react';
import { api } from '../lib/api';

// Icon/desc are display-only; rates come live from /game-rates.
const META: Record<string, { icon: string; desc: string }> = {
  'Single Digit': { icon: '1', desc: 'Pick 1 number' },
  'Jodi Digit': { icon: '12', desc: 'Pick 2 numbers' },
  'Single Panna': { icon: 'P1', desc: 'Pick a 3-digit box' },
  'Single Pana': { icon: 'P1', desc: 'Pick a 3-digit box' },
  'Double Panna': { icon: 'P2', desc: 'Pick a 3-digit box' },
  'Double Pana': { icon: 'P2', desc: 'Pick a 3-digit box' },
  'Triple Panna': { icon: 'P3', desc: 'Pick a 3-digit box' },
  'Triple Pana': { icon: 'P3', desc: 'Pick a 3-digit box' },
  'Half Sangam': { icon: 'HS', desc: 'Open + Panna combo' },
  'Full Sangam': { icon: 'FS', desc: 'Full combo cover' },
};

type DisplayGameType = { icon: string; name: string; desc: string; rate: string };

export function GameTypes() {
  const [gameTypes, setGameTypes] = useState<DisplayGameType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.gameRates(), api.gameTypes().catch(() => [])])
      .then(([rates, types]) => {
        if (rates.length > 0) {
          // If backend has gameTypes, prefer its titles; otherwise use rates
          const typeMap = new Map(types.map((t: any) => [t.title, t]));
          setGameTypes(
            rates.map((r, i) => {
              const t = typeMap.get(r.gameType) as any;
              return {
                icon: META[r.gameType]?.icon ?? (t?.iconName ? t.iconName.slice(0, 2) : String(i + 1)),
                name: r.gameType,
                desc: META[r.gameType]?.desc ?? (t ? (t.isOpen ? 'Open' : 'Closed') : 'Play now'),
                rate: r.rateRange,
              };
            }),
          );
        } else if (types.length > 0) {
          setGameTypes(
            (types as any[]).map((t, i) => ({
              icon: t.iconName ? t.iconName.slice(0, 2) : String(i + 1),
              name: t.title,
              desc: t.isOpen ? 'Open' : 'Closed',
              rate: '—',
            })),
          );
        } else {
          setGameTypes([]);
        }
      })
      .catch(() => setGameTypes([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="game-types" className="py-20 px-5 bg-[#181818] border-y border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs text-[#a3a3a3]">Loading game types…</p>
        </div>
      </section>
    );
  }

  if (gameTypes.length === 0) {
    return (
      <section id="game-types" className="py-20 px-5 bg-[#181818] border-y border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs text-[#a3a3a3]">Game types unavailable right now.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="game-types" className="py-20 px-5 bg-[#181818] border-y border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black">
            Game <span className="text-gradient-gold">Types</span>
          </h2>
          <p className="mt-3 text-[#a3a3a3] max-w-xl mx-auto">
            From quick single-digit picks to high-paying Sangam, there's a game
            for every player.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {gameTypes.map((g) => (
            <div
              key={g.name}
              className="bg-[#1a1a1a] rounded-2xl p-5 text-center card-border hover:border-[#ffd900]/30 hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-[#ffd900]/10 flex items-center justify-center text-[#ffd900] font-black text-sm">
                {g.icon}
              </div>
              <h3 className="mt-4 font-semibold text-sm">{g.name}</h3>
              <p className="mt-1 text-xs text-[#a3a3a3]">{g.desc}</p>
              <p className="mt-2 text-xs text-[#ffd900] font-semibold">
                {g.rate}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
