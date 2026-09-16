const TESTIMONIALS = [
  {
    name: 'Rahul S.',
    city: 'Mumbai',
    text: 'Best matka platform I have used. Withdrawals are really fast, and the results are always on time.',
    stars: 5,
  },
  {
    name: 'Amit K.',
    city: 'Delhi',
    text: 'The interface is super simple. I was placing bids within 5 minutes of registering. Highly recommended.',
    stars: 5,
  },
  {
    name: 'Sneha P.',
    city: 'Pune',
    text: 'Support team is very responsive on WhatsApp. They helped me with my withdrawal the same day.',
    stars: 4,
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 px-5 bg-[#181818] border-y border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black">
            Trusted by <span className="text-gradient-gold">Players</span>{' '}
            Across India
          </h2>
          <p className="mt-3 text-[#a3a3a3] max-w-xl mx-auto">
            Real stories from real players on SATMAT.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-[#1a1a1a] rounded-2xl p-7 card-border"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({length: 5}).map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < t.stars ? 'text-[#ffd900]' : 'text-white/10'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-sm text-[#c9c9c9] leading-relaxed">"{t.text}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ffd900]/10 flex items-center justify-center text-[#ffd900] font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-[#a3a3a3]">{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
