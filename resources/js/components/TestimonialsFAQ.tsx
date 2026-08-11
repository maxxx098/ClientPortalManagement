import React, { useState } from 'react';
import { ChevronDown, Star, Quote } from 'lucide-react';

export const TestimonialsFAQ: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const testimonials = [
    {
      quote: "Mixkura completely replaced three separate tools for our product team. The AI timeline auto-allocation alone saved us over 10 hours of manual rescheduling every sprint.",
      author: "Jessica Vance",
      role: "VP of Product, FinScale",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    {
      quote: "The multi-view flexibility is incredible. Designers love the Kanban view, engineering leads stay on the Timeline grid, and executives get clean velocity charts.",
      author: "David Miller",
      role: "Head of Engineering, Studio99",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    }
  ];

  const faqs = [
    {
      q: "How does the AI timeline auto-scheduling work?",
      a: "Mixkura uses built-in Google Gemini intelligence to analyze task dependencies, member capacity, and project deadlines. It dynamically calculates optimal schedule blocks to prevent team overload."
    },
    {
      q: "Can I import data from Asana, Jira, or Trello?",
      a: "Yes! Mixkura includes 1-click import wizards for Jira, Asana, Trello, and Notion, preserving your task histories, tags, assignees, and dates."
    },
    {
      q: "Is there a free trial period?",
      a: "Yes, we offer a full 14-day free trial on the Pro Smarter plan with no credit card required. You can test all features with your full team."
    },
    {
      q: "Can I customize workspace views and permissions?",
      a: "Absolutely. Mixkura supports custom view filters, granular user role permissions, public share links, and private project spaces."
    }
  ];

  return (
    <section className="py-24 bg-[var(--bg)] relative border-b border-[var(--gray-200)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Testimonials Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--gray-200)] bg-[var(--bg)] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--ink)]"></span>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--gray-500)]">
              06 — Proven Operations
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--ink)] font-sans tracking-tight mb-3">
            Loved by High-Performing Engineering Teams
          </h2>
          <div className="flex items-center justify-center gap-1 text-[var(--ink)]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-[var(--ink)] text-[var(--ink)]" />
            ))}
            <span className="font-mono text-xs font-bold text-[var(--gray-500)] ml-2">4.9/5 from 1,200+ teams</span>
          </div>
        </div>

        {/* Testimonials Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bryl-card p-8 flex flex-col justify-between">
              <Quote className="w-6 h-6 text-[var(--gray-400)] mb-4" />
              <p className="text-[var(--ink)] font-serif italic text-base sm:text-lg leading-relaxed mb-6">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-[var(--gray-200)]">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-10 h-10 rounded-full object-cover grayscale border border-[var(--gray-200)]"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="font-bold text-sm text-[var(--ink)] font-sans">{t.author}</div>
                  <div className="font-mono text-xs text-[var(--gray-400)]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Accordion Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-[var(--ink)] font-sans text-center mb-8">
            Frequently Asked Questions
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="bryl-card overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm text-[var(--ink)] hover:bg-[var(--gray-100)] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[var(--gray-400)] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--ink)]' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-[var(--gray-500)] leading-relaxed border-t border-[var(--gray-200)] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

