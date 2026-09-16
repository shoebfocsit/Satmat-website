import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { WEBAPP_URL } from '../lib/api';

const LINKS = [
  { label: 'Markets', href: '#markets' },
  { label: 'Results', href: '#results' },
  { label: 'Charts', href: '#charts' },
  { label: 'Game Types', href: '#game-types' },
  { label: 'Notices', href: '#notices' },
  { label: 'FAQ', href: '#faq' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#141414]/80 backdrop-blur-xl border-b border-white/5">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-5 h-16">
        <a href="#top" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-[#ffd900] flex items-center justify-center text-[#141414] font-black text-lg">
            S
          </span>
          <span className="font-extrabold tracking-[0.2em] text-sm sm:text-base">
            SATMAT
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-[#a3a3a3] hover:text-[#ffd900] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a
            href={WEBAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[#a3a3a3] hover:text-white transition-colors"
          >
            Sign In
          </a>
          <a
            href={WEBAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold bg-[#ffd900] text-[#141414] px-5 py-2 rounded-lg hover:bg-[#ffe54d] transition-colors gold-glow"
          >
            Play Now
          </a>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-[#1a1a1a] border-t border-white/5 px-5 py-4 space-y-3">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-sm text-[#a3a3a3] hover:text-[#ffd900]"
            >
              {l.label}
            </a>
          ))}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <a
              href={WEBAPP_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="block text-center text-sm text-[#a3a3a3] border border-white/10 rounded-lg px-5 py-2.5"
            >
              Sign In
            </a>
            <a
              href={WEBAPP_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-semibold bg-[#ffd900] text-[#141414] px-5 py-2.5 rounded-lg"
            >
              Play Now
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
