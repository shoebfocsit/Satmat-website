import {useState} from 'react';
import {ChevronDown} from 'lucide-react';

const FAQS = [
  {
    q: 'Is SATMAT legal?',
    a: 'SATMAT operates in a grey area of Indian law similar to other skill-based betting platforms. We recommend all players check their local laws before playing.',
  },
  {
    q: 'How fast are withdrawals?',
    a: 'Withdrawal requests are processed within 2-4 hours on working days. Weekend requests are processed on Monday morning.',
  },
  {
    q: 'What is the minimum deposit amount?',
    a: 'The minimum deposit is ₹10. You can add funds instantly using UPI from your wallet.',
  },
  {
    q: 'How do I check results?',
    a: 'Results are announced on the app at the scheduled closing time. You can also check your winnings in the Winnings section of the app.',
  },
  {
    q: 'Can I play from my mobile?',
    a: 'Yes! SATMAT is fully optimized for mobile browsers. No app download is required to start playing.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 px-5">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black">
            Frequently Asked <span className="text-gradient-gold">Questions</span>
          </h2>
          <p className="mt-3 text-[#a3a3a3]">
            Everything you need to know before you start.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div
              key={f.q}
              className="bg-[#1a1a1a] rounded-xl card-border overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-sm sm:text-base">{f.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-[#ffd900] shrink-0 transition-transform ${
                    open === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {open === i && (
                <p className="px-6 pb-5 text-sm text-[#a3a3a3] leading-relaxed">
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
