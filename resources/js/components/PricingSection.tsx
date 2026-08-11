import React, { useState } from 'react';
import { pricingTiers } from '../data/mockData';
import { Check, ArrowRight, ShieldCheck } from 'lucide-react';

interface PricingSectionProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onOpenAuth }) => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 bg-[var(--gray-50)] relative border-b border-[var(--gray-200)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--gray-200)] bg-[var(--bg)] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--ink)]"></span>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--gray-500)]">
              05 — Transparent Pricing
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-[var(--ink)] font-sans tracking-tight mb-4">
            Simple, Predictable Plans for <br />
            <span className="font-serif italic font-normal text-[var(--ink)]">Teams of All Scales.</span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--gray-500)]">
            Start free for 14 days. No credit card required. Upgrade or adapt anytime.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center gap-2 bg-[var(--bg)] p-1.5 rounded-xl border border-[var(--gray-200)] font-mono text-xs">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                !isAnnual ? 'bg-[var(--ink)] text-[var(--bg)]' : 'text-[var(--gray-500)] hover:text-[var(--ink)]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isAnnual ? 'bg-[var(--ink)] text-[var(--bg)]' : 'text-[var(--gray-500)] hover:text-[var(--ink)]'
              }`}
            >
              <span>Annual</span>
              <span className="bryl-pill-inverted">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {pricingTiers.map((tier) => {
            const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
            return (
              <div
                key={tier.id}
                className={`bryl-card p-8 flex flex-col justify-between relative ${
                  tier.popular
                    ? 'bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)] shadow-xl'
                    : 'bg-[var(--bg)] text-[var(--ink)] border-[var(--gray-200)]'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--bg)] text-[var(--ink)] border border-[var(--gray-200)] px-3 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold tracking-wider">
                    RECOMMENDED
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold font-sans">{tier.name}</h3>
                  </div>
                  <p className={`text-xs mb-6 ${tier.popular ? 'opacity-80' : 'text-[var(--gray-500)]'}`}>
                    {tier.tagline}
                  </p>

                  <div className="flex items-baseline gap-1 mb-6 font-mono">
                    <span className="text-4xl font-bold tracking-tight">
                      ${price}
                    </span>
                    <span className={`text-xs ${tier.popular ? 'opacity-70' : 'text-[var(--gray-400)]'}`}>
                      / member / month
                    </span>
                  </div>

                  <div className="space-y-3 mb-8 border-t pt-6 border-[var(--gray-200)]/30 font-mono text-xs">
                    <span className={`text-[10px] uppercase tracking-wider block mb-2 font-bold ${tier.popular ? 'opacity-70' : 'text-[var(--gray-400)]'}`}>
                      INCLUDED CAPABILITIES:
                    </span>
                    {tier.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onOpenAuth('signup')}
                  className={`w-full py-3 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    tier.popular
                      ? 'bg-[var(--bg)] text-[var(--ink)] hover:opacity-90'
                      : 'bg-[var(--ink)] text-[var(--bg)] hover:opacity-90'
                  }`}
                >
                  <span>{tier.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Security / Guarantee Banner */}
        <div className="mt-12 bryl-card p-6 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--gray-500)]">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[var(--ink)] flex-shrink-0" />
            <div>
              <div className="font-bold text-[var(--ink)]">Enterprise-Grade Security Protocol</div>
              <div>SOC2 Type II Certified, GDPR Compliant & 256-Bit SSL Data Encryption.</div>
            </div>
          </div>

          <button
            onClick={() => onOpenAuth('signup')}
            className="font-bold text-[var(--ink)] underline whitespace-nowrap cursor-pointer"
          >
            Security Docs →
          </button>
        </div>
      </div>
    </section>
  );
};

