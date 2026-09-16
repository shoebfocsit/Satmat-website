import { useState } from 'react';
import {MessageCircle} from 'lucide-react';
import { api, WEBAPP_URL } from '../lib/api';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? '919876543210';

export function CTA() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setStatus('error'); setMsg('Enter a valid email'); return; }
    setStatus('loading');
    try {
      await api.subscribeNewsletter(email.trim());
      setStatus('success');
      setMsg('Subscribed! Check your inbox.');
      setEmail('');
    } catch {
      setStatus('error');
      setMsg('Subscription failed. Try again.');
    }
  };
  return (
    <section id="cta" className="py-20 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#2b2b2b] border border-[#ffd900]/20 p-10 sm:p-16 text-center">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#ffd900]/10 blur-3xl pointer-events-none" />

          <div className="relative">
            <h2 className="text-3xl sm:text-5xl font-black leading-tight">
              Ready to Win{' '}
              <span className="text-gradient-gold">Today?</span>
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-[#a3a3a3]">
              Create your free account now and get a welcome bonus on your first
              deposit. Markets are open — don't miss your round.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={WEBAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#ffd900] text-[#141414] font-bold px-10 py-4 rounded-xl hover:bg-[#ffe54d] transition-colors gold-glow"
              >
                Create Free Account
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 font-semibold px-10 py-4 rounded-xl hover:bg-white/10 transition-colors"
              >
                <MessageCircle size={18} className="text-[#ffd900]" />
                Chat on WhatsApp
              </a>
            </div>
            <form onSubmit={handleSubscribe} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email for updates"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#a3a3a3] focus:outline-none focus:border-[#ffd900]/40"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 rounded-xl bg-[#ffd900] text-[#141414] text-sm font-black hover:bg-[#ffe54d] disabled:opacity-60 transition"
              >
                {status === 'loading' ? '...' : 'Notify Me'}
              </button>
            </form>
            {msg && (
              <p className={`mt-3 text-xs font-semibold ${status === 'success' ? 'text-[#16A34A]' : 'text-[#fca5a5]'}`}>{msg}</p>
            )}
            <p className="mt-6 text-xs text-[#a3a3a3]">
              Play responsibly. 18+. Only for players above the age of 18.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}