import {useEffect, useState} from 'react';
import {UserPlus, Wallet, Play, Banknote} from 'lucide-react';
import {api} from '../lib/api';

const FALLBACK_STEPS = [
  {
    icon: UserPlus,
    title: 'Register',
    desc: 'Create your free account with just your name and phone number.',
  },
  {
    icon: Wallet,
    title: 'Add Funds',
    desc: 'Deposit money into your wallet instantly via UPI.',
  },
  {
    icon: Play,
    title: 'Place Your Bid',
    desc: 'Pick a market, choose a game type, and select your numbers.',
  },
  {
    icon: Banknote,
    title: 'Win & Withdraw',
    desc: 'Results are announced on time. Winnings go straight to your wallet.',
  },
];

export function HowToPlay() {
  const [steps, setSteps] = useState(FALLBACK_STEPS);
  useEffect(() => {
    api.howToPlay()
      .then((res) => {
        if (res.sections && res.sections.length > 0) {
          const icons = [UserPlus, Wallet, Play, Banknote];
          setSteps(
            res.sections.map((s, i) => ({
              icon: icons[i % icons.length],
              title: s.title,
              desc: s.body,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);
  return (
    <section id="how-to-play" className="py-20 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black">
            How to <span className="text-gradient-gold">Play</span>
          </h2>
          <p className="mt-3 text-[#a3a3a3] max-w-xl mx-auto">
            Get started in minutes with these four simple steps.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative bg-[#1a1a1a] rounded-2xl p-7 card-border"
            >
              <div className="absolute top-5 right-6 text-5xl font-black text-white/5">
                {i + 1}
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#ffd900]/10 flex items-center justify-center mb-5">
                <s.icon className="text-[#ffd900]" size={24} />
              </div>
              <h3 className="font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-[#a3a3a3] leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
