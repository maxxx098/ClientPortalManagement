import React from 'react';
import { solutionsData } from '../data/mockData';
import { Layers, Palette, TrendingUp, Code, ArrowRight } from 'lucide-react';

interface SolutionsSectionProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const SolutionsSection: React.FC<SolutionsSectionProps> = ({ onOpenAuth }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers':
        return <Layers className="w-5 h-5 text-[var(--ink)]" />;
      case 'Palette':
        return <Palette className="w-5 h-5 text-[var(--ink)]" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-[var(--ink)]" />;
      default:
        return <Code className="w-5 h-5 text-[var(--ink)]" />;
    }
  };

  return (
    <section id="solutions" className="py-24 bg-[var(--gray-50)] relative border-b border-[var(--gray-200)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--gray-200)] bg-[var(--bg)] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--ink)]"></span>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--gray-500)]">
              03 — Tailored Workflows
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-[var(--ink)] font-sans tracking-tight mb-4">
            Designed for how <br />
            <span className="font-serif italic font-normal text-[var(--ink)]">your team actually operates.</span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--gray-500)] leading-relaxed">
            Whether you are shipping software, managing creative sprints, or scaling growth campaigns — Mixkura adapts to your specific operational structures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {solutionsData.map((sol, index) => (
            <div
              key={index}
              className="bryl-card p-6 flex flex-col justify-between group hover:border-[var(--ink)] transition-all duration-200"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-[var(--gray-100)] flex items-center justify-center mb-5 border border-[var(--gray-200)]">
                  {getIcon(sol.icon)}
                </div>
                <h3 className="text-base font-bold text-[var(--ink)] font-sans mb-2">{sol.title}</h3>
                <p className="text-xs text-[var(--gray-500)] leading-relaxed mb-6">
                  {sol.description}
                </p>
              </div>

              <button
                onClick={() => onOpenAuth('signup')}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[var(--ink)] hover:underline pt-4 border-t border-[var(--gray-200)] cursor-pointer"
              >
                <span>Explore Template</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

