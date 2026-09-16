import {useCallback, useEffect, useState} from 'react'
import {RefreshCw, Trophy, AlertTriangle} from 'lucide-react'
import type {ResultsResponse} from '../lib/api'
import {fetchResults} from '../lib/api'
import {LIVE_POLL_MS, isTabVisible} from '../lib/live'
import {ResultCard} from './ResultCard'

export function ResultsScreen() {
  const [data, setData] = useState<ResultsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (asRefresh: boolean) => {
    if (asRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const {data: res} = await fetchResults()
      setData(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load results')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void load(false)
  }, [load])

  // Live sync: silent re-check every 5s (no skeleton flash). Failures stay
  // silent — the last good snapshot keeps showing until the backend answers.
  useEffect(() => {
    const id = setInterval(() => {
      if (!isTabVisible()) return
      fetchResults().then(({data: res}) => {
        setData(res)
        setError(null)
      }).catch(() => {})
    }, LIVE_POLL_MS)
    return () => clearInterval(id)
  }, [])

  const markets = data?.markets ?? []

  const formatUpdatedAt = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#ffd900] flex items-center justify-center shadow-sm">
              <Trophy size={20} className="text-[#141414]" />
            </span>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-wide">Results</h1>
              <p className="text-xs font-medium text-gray-500">
                Today&apos;s declared results for all markets
              </p>
            </div>
          </div>
          <button
            onClick={() => void load(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition disabled:opacity-60 active:scale-[0.98]"
            aria-label="Refresh results"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : markets.length === 0 ? (
          <p className="text-center text-xs text-gray-500 py-10">No results declared yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {markets.map((m) => (
              <ResultCard key={m.id} market={m} />
            ))}
          </div>
        )}

        {data && (
          <p className="mt-6 text-center text-[11px] font-medium text-gray-400">
            Last updated:{' '}
            <span className="text-gray-500">{formatUpdatedAt(data.updatedAt)}</span>
          </p>
        )}
      </div>
    </div>
  )
}
