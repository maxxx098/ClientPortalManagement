import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { ChevronDown, Sparkles, Layout, BarChart2, Sun, Moon} from 'lucide-react';
import { Link } from '@inertiajs/react'
interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenFullDemo: () => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenFullDemo, activeSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[var(--bg)]/90 backdrop-blur-md py-3 border-b border-[var(--gray-200)]'
          : 'bg-transparent py-4 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <Logo />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); scrollTo('home'); }}
            className={`font-mono text-xs uppercase tracking-wider transition-colors hover:text-[var(--ink)] ${
              activeSection === 'home' ? 'text-[var(--ink)] font-bold' : 'text-[var(--gray-500)]'
            }`}
          >
            Home
          </a>

          {/* Features Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setFeaturesDropdownOpen(true)}
            onMouseLeave={() => setFeaturesDropdownOpen(false)}
          >
            <button
              onClick={() => scrollTo('features')}
              className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-[var(--gray-500)] hover:text-[var(--ink)] transition-colors py-1 cursor-pointer"
            >
              <span>Features</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${featuresDropdownOpen ? 'rotate-180 text-[var(--ink)]' : 'text-[var(--gray-400)]'}`} />
            </button>

            {featuresDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-72 bg-[var(--bg)] rounded-xl border border-[var(--gray-200)] p-2 grid gap-1 z-50 shadow-lg animate-in fade-in duration-150">
                <a
                  href="#features"
                  onClick={() => scrollTo('features')}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--gray-100)] transition-colors group"
                >
                  <div className="p-1.5 rounded-md bg-[var(--gray-100)] text-[var(--ink)] group-hover:bg-[var(--ink)] group-hover:text-[var(--bg)] transition-colors">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--ink)]">AI Scheduling</div>
                    <div className="font-mono text-[10px] text-[var(--gray-400)]">Automated workload distribution</div>
                  </div>
                </a>

                <a
                  href="#views"
                  onClick={() => scrollTo('views')}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--gray-100)] transition-colors group"
                >
                  <div className="p-1.5 rounded-md bg-[var(--gray-100)] text-[var(--ink)] group-hover:bg-[var(--ink)] group-hover:text-[var(--bg)] transition-colors">
                    <Layout className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--ink)]">Multi-View Matrix</div>
                    <div className="font-mono text-[10px] text-[var(--gray-400)]">Timeline, Kanban & List</div>
                  </div>
                </a>

                <a
                  href="#analytics"
                  onClick={() => scrollTo('analytics')}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--gray-100)] transition-colors group"
                >
                  <div className="p-1.5 rounded-md bg-[var(--gray-100)] text-[var(--ink)] group-hover:bg-[var(--ink)] group-hover:text-[var(--bg)] transition-colors">
                    <BarChart2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--ink)]">Operational Analytics</div>
                    <div className="font-mono text-[10px] text-[var(--gray-400)]">Velocity & Capacity metrics</div>
                  </div>
                </a>
              </div>
            )}
          </div>

          <a
            href="#solutions"
            onClick={(e) => { e.preventDefault(); scrollTo('solutions'); }}
            className="font-mono text-xs uppercase tracking-wider text-[var(--gray-500)] hover:text-[var(--ink)] transition-colors"
          >
            Solutions
          </a>

          <a
            href="#analytics"
            onClick={(e) => { e.preventDefault(); scrollTo('analytics'); }}
            className="font-mono text-xs uppercase tracking-wider text-[var(--gray-500)] hover:text-[var(--ink)] transition-colors"
          >
            Analytics
          </a>

          <a
            href="#pricing"
            onClick={(e) => { e.preventDefault(); scrollTo('pricing'); }}
            className="font-mono text-xs uppercase tracking-wider text-[var(--gray-500)] hover:text-[var(--ink)] transition-colors"
          >
            Pricing
          </a>
        </nav>

        {/* Right CTA Actions & Theme Switcher */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-[var(--gray-200)] text-[var(--gray-500)] hover:text-[var(--ink)] hover:bg-[var(--gray-100)] transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <Link
            href="/login"
            className="font-mono text-xs uppercase tracking-wider text-[var(--gray-500)] hover:text-[var(--ink)] px-2.5 py-1.5 transition-colors cursor-pointer"
          >
            Login
          </Link>

          <Link
            href="/login"
            className="font-mono text-xs uppercase tracking-wider text-[var(--bg)] bg-[var(--ink)] hover:opacity-90 px-4 py-1.5 rounded-lg transition-all cursor-pointer font-bold"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
};

