import type { ResultMarket } from '../lib/api'

interface ResultCardProps {
  market: ResultMarket
}

/** Reusable result card — light background, yellow highlight for `highlight`
 *  markets, Jodi + Panel red pills. */
export function ResultCard({market}: ResultCardProps) {
  const {name, openTime, closeTime, highlight, result} = market
  const jodi = result?.jodi ?? null
  const panel = result?.panel ?? null
  const declared = jodi !== null && panel !== null

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm transition ${
        highlight ? 'bg-[#FFF8D6] border-[#FBC02D]' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-black text-gray-900 tracking-wide truncate">{name}</h3>
          <p className="text-[11px] font-medium text-gray-500 mt-0.5">
            {openTime} – {closeTime}
          </p>
        </div>
        {highlight && (
          <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#FBC02D]/20 text-[#7A5C00]">
            Hot
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex flex-col items-center gap-1">
          <span className="px-3 py-1.5 rounded-full bg-[#E53935] text-white text-sm font-black min-w-[52px] text-center shadow-sm">
            {jodi ?? '--'}
          </span>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Jodi</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="px-3 py-1.5 rounded-full bg-[#C62828] text-white text-sm font-black min-w-[64px] text-center shadow-sm">
            {panel ?? '---'}
          </span>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Panel</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {declared && result ? (
          <p className="text-[10px] text-gray-500 font-medium">
            Declared on <span className="font-bold text-gray-700">{result.date}</span>
          </p>
        ) : (
          <p className="text-[10px] text-gray-400 font-medium italic">Result not declared yet</p>
        )}
        {result?.source && (
          <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider">
            {result.source}
          </span>
        )}
      </div>
    </div>
  )
}