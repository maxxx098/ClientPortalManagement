import React from 'react';
import { Logo } from './Logo';
import { ArrowUpRight, Github, Twitter, Linkedin } from 'lucide-react';

interface FooterProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenFullDemo: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAuth, onOpenFullDemo }) => {
  return (
    <footer className="bg-[var(--ink)] text-[var(--bg)] pt-20 pb-12 border-t border-[var(--gray-200)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top CTA Banner */}
        <div className="bg-[var(--gray-100)] text-[var(--ink)] p-8 sm:p-12 rounded-2xl border border-[var(--gray-200)] shadow-xl mb-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl sm:text-4xl font-bold font-sans tracking-tight text-[var(--ink)] mb-2">
              Ready to scale your business smarter?
            </h3>
            <p className="text-[var(--gray-500)] text-xs sm:text-sm max-w-xl font-mono">
              Join 12,000+ teams using Mixkura to automate task timelines, streamline workloads, and boost velocity.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 font-mono text-xs font-bold">
            <button
              onClick={() => onOpenAuth('signup')}
              className="bryl-btn-primary px-6 py-3"
            >
              <span>Get Started Free</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenFullDemo}
              className="bryl-btn-secondary px-6 py-3"
            >
              Test Live App
            </button>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-[var(--gray-800)] font-mono text-xs">
          <div className="col-span-2 space-y-4">
            <Logo className="text-[var(--bg)]" />
            <p className="text-xs text-[var(--gray-400)] max-w-sm leading-relaxed">
              Mixkura is the minimal, monochrome operational framework built for modern engineering and product teams.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <a href="#" className="p-2 rounded-lg bg-[var(--gray-800)] text-[var(--gray-300)] hover:text-[var(--bg)] transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-[var(--gray-800)] text-[var(--gray-300)] hover:text-[var(--bg)] transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-[var(--gray-800)] text-[var(--gray-300)] hover:text-[var(--bg)] transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase font-bold text-[var(--gray-300)] tracking-[0.15em] mb-4">Product</h4>
            <ul className="space-y-2.5 text-[var(--gray-400)]">
              <li><a href="#features" className="hover:text-[var(--bg)] transition-colors">AI Scheduling</a></li>
              <li><a href="#features" className="hover:text-[var(--bg)] transition-colors">Timeline Grid</a></li>
              <li><a href="#features" className="hover:text-[var(--bg)] transition-colors">Kanban Board</a></li>
              <li><a href="#analytics" className="hover:text-[var(--bg)] transition-colors">Analytics Engine</a></li>
              <li><a href="#pricing" className="hover:text-[var(--bg)] transition-colors">Pricing Plans</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] uppercase font-bold text-[var(--gray-300)] tracking-[0.15em] mb-4">Solutions</h4>
            <ul className="space-y-2.5 text-[var(--gray-400)]">
              <li><a href="#solutions" className="hover:text-[var(--bg)] transition-colors">Product Managers</a></li>
              <li><a href="#solutions" className="hover:text-[var(--bg)] transition-colors">Design Studios</a></li>
              <li><a href="#solutions" className="hover:text-[var(--bg)] transition-colors">Growth Teams</a></li>
              <li><a href="#solutions" className="hover:text-[var(--bg)] transition-colors">Engineering Sprints</a></li>
              <li><a href="#solutions" className="hover:text-[var(--bg)] transition-colors">Enterprise Systems</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] uppercase font-bold text-[var(--gray-300)] tracking-[0.15em] mb-4">Company</h4>
            <ul className="space-y-2.5 text-[var(--gray-400)]">
              <li><a href="#" className="hover:text-[var(--bg)] transition-colors">About Mixkura</a></li>
              <li><a href="#" className="hover:text-[var(--bg)] transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-[var(--bg)] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[var(--bg)] transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[var(--bg)] transition-colors">Security Overview</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between font-mono text-[11px] text-[var(--gray-400)] gap-4">
          <div>
            © {new Date().getFullYear()} Mixkura Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Designed in Bryl-Minimal monochrome language</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

