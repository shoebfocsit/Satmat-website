import {
  Wallet,
  ShieldCheck,
  Timer,
  Headset,
  Gift,
  Smartphone,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Wallet,
    title: 'Instant Wallet',
    desc: 'Add funds via UPI and see your balance update instantly. No waiting, no delays.',
  },
  {
    icon: Timer,
    title: 'Fast Withdrawals',
    desc: 'Withdrawals processed within 2-4 hours on working days. Your winnings, your money.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Fair',
    desc: 'Bank-grade encryption and transparent results. Play with complete peace of mind.',
  },
  {
    icon: Gift,
    title: 'Welcome Bonus',
    desc: 'New players get a free welcome bonus on their first deposit. More balance, more chances.',
  },
  {
    icon: Headset,
    title: '24/7 Support',
    desc: 'Our support team is always available on WhatsApp and phone to help you out.',
  },
  {
    icon: Smartphone,
    title: 'Play Anywhere',
    desc: 'Optimized for every device. Play from your phone, tablet, or desktop browser.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black">
            Why Choose <span className="text-gradient-gold">SATMAT</span>
          </h2>
          <p className="mt-3 text-[#a3a3a3] max-w-xl mx-auto">
            Everything you need for a smooth, safe, and exciting gaming
            experience.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group bg-[#1a1a1a] rounded-2xl p-7 card-border hover:border-[#ffd900]/30 hover:bg-[#202020] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#ffd900]/10 flex items-center justify-center mb-5 group-hover:bg-[#ffd900]/20 transition-colors">
                <f.icon className="text-[#ffd900]" size={24} />
              </div>
              <h3 className="font-bold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-[#a3a3a3] leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
