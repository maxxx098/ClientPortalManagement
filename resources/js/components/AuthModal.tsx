import React, { useState } from 'react';
import { X, ArrowRight, Github, Mail } from 'lucide-react';
import { Logo } from './Logo';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'login' | 'signup';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[var(--bg)] rounded-xl shadow-2xl border border-[var(--gray-200)] w-full max-w-md overflow-hidden relative text-[var(--ink)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-[var(--gray-400)] hover:text-[var(--ink)] hover:bg-[var(--gray-100)] transition-colors z-10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 text-center border-b border-[var(--gray-200)] bg-[var(--gray-50)]">
          <div className="inline-block mb-3">
            <Logo />
          </div>
          <h3 className="text-xl font-bold font-sans">
            {mode === 'login' ? 'Welcome back to Mixkura' : 'Create Mixkura Account'}
          </h3>
          <p className="font-mono text-xs text-[var(--gray-500)] mt-1">
            {mode === 'login'
              ? 'Access your minimal task management workspace'
              : 'Join over 12,000+ teams scaling operations'}
          </p>
        </div>

        <div className="p-8 space-y-4 font-mono text-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-[var(--gray-500)] mb-1 text-left">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[var(--gray-200)] bg-[var(--bg)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] transition-all font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] text-[var(--gray-500)] mb-1 text-left">
                Work Email
              </label>
              <input
                type="email"
                required
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-[var(--gray-200)] bg-[var(--bg)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] text-[var(--gray-500)] mb-1 text-left">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-[var(--gray-200)] bg-[var(--bg)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg bg-[var(--ink)] text-[var(--bg)] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:opacity-90"
            >
              <span>{isSubmitting ? 'Authenticating...' : mode === 'login' ? 'Log In to Workspace' : 'Create Free Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--gray-200)]"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-[var(--bg)] px-2 text-[var(--gray-400)] font-mono">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              className="bryl-btn-secondary py-2 justify-center"
            >
              <Mail className="w-3.5 h-3.5 text-[var(--ink)]" />
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="bryl-btn-secondary py-2 justify-center"
            >
              <Github className="w-3.5 h-3.5 text-[var(--ink)]" />
              <span>GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

