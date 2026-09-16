import {useCallback, useMemo, useState, useEffect} from 'react'
import {BarChart3, CalendarDays, AlertTriangle} from 'lucide-react'
import type {ChartRangeResponse} from '../lib/api'
import {api, fetchChartRange, fetchResults} from '../lib/api'
import {LIVE_POLL_MS, isTabVisible, resultSignature} from '../lib/live'
import {LineChart} from './LineChart'

function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function defaultRange() {
  // Chart always opens on the present day (start = end = today).
  const today = toIso(new Date())
  return {start: today, end: today}
}

export function ChartsScreen() {
  const initial = useMemo(defaultRange, [])
  const [liveMarkets, setLiveMarkets] = useState<Array<{ id: string; name: string; highlight?: boolean }>>([])
  const [marketId, setMarketId] = useState<string>('')
  const [startDate, setStartDate] = useState<string>(initial.start)
  const [endDate, setEndDate] = useState<string>(initial.end)
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)
  const [pickerMonth, setPickerMonth] = useState<Date>(new Date())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ChartRangeResponse | null>(null)

  const selectedMarket = liveMarkets.find((m) => m.id === marketId) || null

  useEffect(() => {
    api.markets().then((list) => {
      const mapped = list.map((m, i) => ({ id: m.id, name: m.name, highlight: i === 0 }))
      setLiveMarkets(mapped)
      if (mapped.length) setMarketId((prev) => prev || mapped[0].id)
    }).catch(() => {})
  }, [])

  const load = useCallback(async () => {
    setError(null)
    if (!startDate || !endDate) {
      setError('Please choose both a start and an end date.')
      return
    }
    if (startDate > endDate) {
      setError('Start date must be on or before the end date.')
      return
    }
    if (!marketId) {
      setError('Please select a market.')
      return
    }
    setLoading(true)
    try {
      const {data} = await fetchChartRange({
        market: marketId,
        startDate,
        endDate,
      })
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load chart')
    } finally {
      setLoading(false)
    }
  }, [marketId, startDate, endDate])

  // Auto-load when the market pills pick the first market (or the user taps
  // another pill) — no dead screen waiting for the Load button.
  useEffect(() => {
    if (marketId) void load()
  }, [marketId, load])

  // Live sync: watch the lightweight /results signal every 5s and refetch
  // this range only when the selected market's latest declare actually
  // changed inside the viewed range. The heavy /charts payload never polls.
  useEffect(() => {
    const id = setInterval(() => {
      if (!isTabVisible() || !marketId) return
      fetchResults().then(({data}) => {
        const m = data.markets?.find((x) => x.id === marketId)
        const latest = m?.result ?? null
        if (!latest?.date || latest.date < startDate || latest.date > endDate) return
        const rows = result?.data ?? []
        const last = rows.length
          ? [...rows].sort((a, b) => a.date.localeCompare(b.date)).pop()!
          : null
        if (resultSignature(last) !== resultSignature(latest)) void load()
      }).catch(() => {})
    }, LIVE_POLL_MS)
    return () => clearInterval(id)
  }, [marketId, startDate, endDate, result, load])

  const formatDate = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const chartSeries = useMemo(() => {
    if (!result) return []
    const points = result.data
      .filter((r) => r.open !== null && r.close !== null)
      .map((r) => ({label: r.date.slice(8), open: Number(r.open), close: Number(r.close)}))
    return [
      {name: 'Open', color: '#F59E0B', points: points.map((p) => ({label: p.label, value: p.open}))},
      {name: 'Close', color: '#2563EB', points: points.map((p) => ({label: p.label, value: p.close}))},
    ]
  }, [result])

  const renderMiniCalendar = (onPick: (d: Date) => void) => {
    const year = pickerMonth.getFullYear()
    const month = pickerMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const startWeekday = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: (number | null)[] = [
      ...Array.from({length: startWeekday}, () => null),
      ...Array.from({length: daysInMonth}, (_, i) => i + 1),
    ]
    return (
      <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setPickerMonth(new Date(year, month - 1, 1))}
            className="text-gray-400 hover:text-gray-900 px-2"
          >
            ‹
          </button>
          <p className="text-xs font-bold text-gray-800">
            {pickerMonth.toLocaleDateString('en-GB', {month: 'long', year: 'numeric'})}
          </p>
          <button
            onClick={() => setPickerMonth(new Date(year, month + 1, 1))}
            className="text-gray-400 hover:text-gray-900 px-2"
          >
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-400 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {cells.map((day, i) =>
            day === null ? (
              <div key={i} />
            ) : (
              <button
                key={i}
                onClick={() => onPick(new Date(year, month, day))}
                className="py-1.5 rounded-lg text-[11px] font-semibold text-gray-800 hover:bg-gray-100"
              >
                {day}
              </button>
            ),
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-10 h-10 rounded-xl bg-[#ffd900] flex items-center justify-center shadow-sm">
            <BarChart3 size={20} className="text-[#141414]" />
          </span>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-wide">Charts</h1>
            <p className="text-xs font-medium text-gray-500">
              Date-range charts across all result markets
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Select Market
          </p>
          <div className="flex flex-wrap gap-2">
            {liveMarkets.length === 0 ? (
              <p className="text-xs text-gray-400">Loading markets…</p>
            ) : liveMarkets.map((m) => (
              <button
                key={m.id}
                onClick={() => setMarketId(m.id)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition active:scale-[0.97] ${
                  m.id === marketId
                    ? m.highlight
                      ? 'bg-[#FBC02D] text-[#4E3A00] shadow-sm'
                      : 'bg-gray-900 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div className="relative">
                <button
                  onClick={() => {
                    setShowStartPicker((v) => !v)
                    setShowEndPicker(false)
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-[#F4F5F7] border border-gray-200 hover:border-gray-300 transition"
                >
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">Start Date</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{formatDate(startDate)}</p>
                </button>
                {showStartPicker && (
                  <div className="absolute left-0 top-full mt-2 z-30 w-72 max-w-[calc(100vw-3rem)]">
                    {renderMiniCalendar((d) => {
                      setStartDate(toIso(d))
                      setShowStartPicker(false)
                    })}
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => {
                    setShowEndPicker((v) => !v)
                    setShowStartPicker(false)
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-[#F4F5F7] border border-gray-200 hover:border-gray-300 transition"
                >
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">End Date</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{formatDate(endDate)}</p>
                </button>
                {showEndPicker && (
                  <div className="absolute left-0 top-full mt-2 z-30 w-72 max-w-[calc(100vw-3rem)]">
                    {renderMiniCalendar((d) => {
                      setEndDate(toIso(d))
                      setShowEndPicker(false)
                    })}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => void load()}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#ffd900] text-[#141414] text-sm font-black hover:bg-[#ffe54d] transition disabled:opacity-60 active:scale-[0.98] shadow-sm"
            >
              {loading ? 'Loading…' : 'Load Chart'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}
        {result && (
          <div className="mt-5 space-y-5">
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Total Results
                </p>
                <p className="text-2xl font-black text-gray-900 mt-0.5">
                  {result.count}
                  <span className="text-xs font-semibold text-gray-400 ml-2">results</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Range</p>
                <p className="text-xs font-bold text-gray-800 mt-0.5">
                  {formatDate(result.startDate)} – {formatDate(result.endDate)}
                </p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{selectedMarket?.name}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays size={14} className="text-gray-400" />
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">
                  Open vs Close trend
                </h3>
              </div>
              <LineChart series={chartSeries} height={200} />
            </div>

            {result.missingDates.length > 0 && (
              <div className="bg-gray-100 rounded-xl px-4 py-3 text-xs text-gray-500 font-medium">
                {result.missingDates.length} date(s) in this range have no declared result (e.g.{' '}
                {result.missingDates.slice(0, 3).join(', ')}
                {result.missingDates.length > 3 ? ', …' : ''}). Missing dates are shown honestly —
                no data is fabricated.
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {/* 5-column table scrolls horizontally on narrow phones instead of squeezing. */}
              <div className="overflow-x-auto">
              <div className="min-w-[560px]">
              <div className="grid grid-cols-5 gap-2 px-4 py-3 bg-gray-900">
                {['Date', 'Jodi', 'Panel', 'Open', 'Close'].map((h) => (
                  <p
                    key={h}
                    className={`text-[10px] font-bold uppercase text-center ${h === 'Jodi' ? 'text-[#ffd900]' : 'text-gray-300'}`}
                  >
                    {h}
                  </p>
                ))}
              </div>
              {result.data.length === 0 ? (
                <p className="px-4 py-8 text-center text-xs text-gray-400 font-medium">
                  No results declared in this date range.
                </p>
              ) : (
                result.data.map((r) => (
                  <div
                    key={r.date}
                    className="grid grid-cols-5 gap-2 px-4 py-2.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition"
                  >
                    <p className="text-xs font-semibold text-gray-500 text-center">{r.date}</p>
                    <p className="text-center text-xs font-black text-gray-900">{r.jodi ?? '—'}</p>
                    <p className="text-center text-xs font-black text-gray-900">{r.panel ?? '—'}</p>
                    <p className="text-center text-xs font-bold text-amber-600">{r.open ?? '—'}</p>
                    <p className="text-center text-xs font-bold text-blue-600">{r.close ?? '—'}</p>
                  </div>
                ))
              )}
              </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
