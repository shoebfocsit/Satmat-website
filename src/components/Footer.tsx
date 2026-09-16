import { useEffect, useState } from 'react';
import { api, WEBAPP_URL } from '../lib/api';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? '919876543210';

export function Footer() {
  const [supportPhone, setSupportPhone] = useState(WHATSAPP_NUMBER);
  const [emailInput, setEmailInput] = useState('');
  const [subStatus, setSubStatus] = useState('');
  useEffect(() => {
    api.appConfig().then((c) => {
      const s: any = c.supportContacts || {};
      if (s.whatsapp || s.phone) setSupportPhone(String(s.whatsapp || s.phone).replace(/\D/g, ''));
    }).catch(() => {});
  }, []);
  const handleSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) { setSubStatus('Invalid email'); return; }
    try {
      await api.subscribeNewsletter(emailInput.trim());
      setSubStatus('Subscribed!');
      setEmailInput('');
    } catch {
      setSubStatus('Failed — try again');
    }
  };
  return (
    <footer className="py-14 px-5 bg-[#0f0f0f] border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <a href="#top" className="inline-flex items-center gap-2 mb-4" aria-label="Back to top">
              <span className="w-8 h-8 rounded-lg bg-[#ffd900] flex items-center justify-center text-[#141414] font-black text-lg">
                S
              </span>
              <span className="font-extrabold tracking-[0.2em]">SATMAT</span>
            </a>
            <p className="text-sm text-[#a3a3a3] leading-relaxed">
              India&apos;s trusted Satta Matka platform. Play smart, win big, and
              withdraw fast.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4">Explore</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Markets', href: '#markets' },
                { label: 'Results', href: '#results' },
                { label: 'Charts', href: '#charts' },
                { label: 'Game Types', href: '#game-types' },
                { label: 'Notices', href: '#notices' },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm text-[#a3a3a3] hover:text-[#ffd900] transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4">Play</h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={WEBAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[#a3a3a3] hover:text-[#ffd900] transition-colors"
                >
                  Open the App
                </a>
              </li>
              <li>
                <a
                  href="#how-to-play"
                  className="text-sm text-[#a3a3a3] hover:text-[#ffd900] transition-colors"
                >
                  How to Play
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${supportPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[#a3a3a3] hover:text-[#ffd900] transition-colors"
                >
                  Contact Support
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-sm text-[#a3a3a3] hover:text-[#ffd900] transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4">Play Safe</h4>
            <ul className="space-y-2.5 text-sm text-[#a3a3a3]">
              <li>18+ only</li>
              <li>Play responsibly</li>
              <li>Never bet what you can&apos;t afford to lose</li>
            </ul>
            <form onSubmit={handleSub} className="mt-4 flex gap-2">
              <input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Email for updates"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-[#a3a3a3] focus:outline-none focus:border-[#ffd900]/30"
              />
              <button type="submit" className="px-3 py-1.5 rounded-lg bg-[#ffd900] text-[#141414] text-xs font-bold hover:bg-[#ffe54d]">Subscribe</button>
            </form>
            {subStatus && <p className="mt-1 text-xs text-[#ffd900]">{subStatus}</p>}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#a3a3a3]">
          <span>© 2026 SATMAT. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffd900]" />
            Play responsibly. 18+
          </span>
        </div>
      </div>
    </footer>
  );
}
