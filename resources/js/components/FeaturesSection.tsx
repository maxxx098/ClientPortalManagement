import React, { useState } from 'react';
import { featureItems } from '../data/mockData';
import { Sparkles, CalendarRange, BarChart3, Zap, CheckCircle2 } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const [activeFeatureId, setActiveFeatureId] = useState(featureItems[0].id);

  const activeFeature = featureItems.find(f => f.id === activeFeatureId) || featureItems[0];

  const getIcon = (name: string) => {
    switch (name) {
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'CalendarRange':
        return <CalendarRange className="w-4 h-4" />;
      case 'BarChart3':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <section id="features" className="py-24 bg-[var(--bg)] border-t border-[var(--gray-200)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--gray-200)] bg-[var(--bg)] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--ink)]"></span>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--gray-500)]">
              02 — Core Capabilities
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-[var(--ink)] tracking-tight font-sans mb-4">
            Everything Required for <br />
            <span className="font-serif italic font-normal text-[var(--ink)]">Flawless Execution.</span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--gray-500)] leading-relaxed">
            Bridge high-level strategic roadmap goals with granular day-to-day execution. Eliminate workflow friction with automated scheduling and real-time clarity.
          </p>
        </div>

        {/* Interactive Feature Cards & Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Feature Selection Tabs */}
          <div className="lg:col-span-5 space-y-3">
            {featureItems.map((item) => {
              const isActive = item.id === activeFeatureId;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveFeatureId(item.id)}
                  className={`p-5 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)] shadow-md'
                      : 'bg-[var(--bg)] hover:bg-[var(--gray-50)] border-[var(--gray-200)] text-[var(--ink)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-[var(--bg)] text-[var(--ink)]' : 'bg-[var(--gray-100)] text-[var(--ink)]'}`}>
                        {getIcon(item.iconName)}
                      </div>
                      <h3 className="font-bold text-base font-sans">{item.title}</h3>
                    </div>
                    {item.badge && (
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                        isActive ? 'bg-[var(--bg)]/20 text-[var(--bg)] border border-[var(--bg)]/30' : 'bg-[var(--gray-100)] text-[var(--gray-500)]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs leading-relaxed ${isActive ? 'opacity-80' : 'text-[var(--gray-500)]'}`}>
                    {item.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2 font-mono text-[11px] font-bold">
                    <span className={isActive ? 'text-[var(--bg)] underline' : 'text-[var(--ink)]'}>
                      {item.highlightText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Visual Interactive Feature Preview Canvas */}
          <div className="lg:col-span-7 bg-[var(--ink)] p-6 sm:p-8 rounded-2xl text-[var(--bg)] shadow-xl relative overflow-hidden border border-[var(--ink)]">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--bg)]/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--bg)] animate-pulse"></div>
                  <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">
                    FEATURE // {activeFeature.badge}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold bg-[var(--bg)]/10 px-2.5 py-1 rounded border border-[var(--bg)]/20">
                  ENGINE ACTIVE
                </span>
              </div>

              <div className="space-y-4">
                <h4 className="text-2xl font-bold font-sans text-[var(--bg)]">{activeFeature.title}</h4>
                <p className="opacity-80 text-xs sm:text-sm leading-relaxed">
                  {activeFeature.description}
                </p>

                {/* Interactive Feature Widget */}
                <div className="bg-[var(--bg)]/10 rounded-xl p-5 border border-[var(--bg)]/20 space-y-3">
                  <div className="flex items-center justify-between font-mono text-xs opacity-90">
                    <span>Optimization Balance</span>
                    <span className="font-bold text-[var(--bg)]">100% Balanced</span>
                  </div>

                  <div className="w-full bg-[var(--bg)]/20 h-2 rounded-full overflow-hidden">
                    <div className="bg-[var(--bg)] h-full w-[88%] transition-all duration-500"></div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                    <div className="bg-[var(--bg)]/10 p-2.5 rounded-lg border border-[var(--bg)]/10">
                      <div className="text-base font-bold font-mono text-[var(--bg)]">98.4%</div>
                      <div className="font-mono text-[9px] opacity-70">On-Time Sprint</div>
                    </div>
                    <div className="bg-[var(--bg)]/10 p-2.5 rounded-lg border border-[var(--bg)]/10">
                      <div className="text-base font-bold font-mono text-[var(--bg)]">-35%</div>
                      <div className="font-mono text-[9px] opacity-70">Context Switch</div>
                    </div>
                    <div className="bg-[var(--bg)]/10 p-2.5 rounded-lg border border-[var(--bg)]/10">
                      <div className="text-base font-bold font-mono text-[var(--bg)]">12.4x</div>
                      <div className="font-mono text-[9px] opacity-70">Team Velocity</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs opacity-90 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Real-time cross-platform integration with GitHub & Slack</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs opacity-90 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>AI-assisted subtask breakdown & dependency resolution</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

