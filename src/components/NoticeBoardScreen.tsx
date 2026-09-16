import { useEffect, useState } from 'react';
import { Bell, AlertTriangle } from 'lucide-react';
import { api, type Notice } from '../lib/api';

export function NoticeBoardScreen() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.notices()
      .then((d) => setNotices(d))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load notices'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Bell size={18} className="text-[#ffd900]" />
          <h2 className="text-xl font-black text-white">Notice Board</h2>
        </div>

        {loading ? (
          <p className="text-xs text-[#a3a3a3] px-1">Loading notices…</p>
        ) : error ? (
          <p className="text-xs font-semibold text-[#fca5a5] bg-[#7f1d1d]/30 border border-[#ef4444]/30 rounded-xl px-4 py-3">{error}</p>
        ) : notices.length === 0 ? (
          <p className="text-xs text-[#a3a3a3] px-1">No notices right now.</p>
        ) : (
          notices.map((n) => (
            <div
              key={n.id}
              className={`rounded-2xl p-5 border transition ${
                n.isImportant
                  ? 'bg-[#1a1a1a] border-[#ffd900]/40'
                  : 'bg-[#1a1a1a] border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {n.isImportant && (
                    <span className="bg-[#ffd900]/15 text-[#ffd900] p-1.5 rounded-lg shrink-0">
                      <AlertTriangle size={14} />
                    </span>
                  )}
                  <h3 className="font-extrabold text-sm text-white">{n.title}</h3>
                </div>
                <span className="text-[10px] text-[#a3a3a3] shrink-0">{n.date}</span>
              </div>
              <p className="mt-2 text-xs text-[#a3a3a3] leading-relaxed">{n.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
