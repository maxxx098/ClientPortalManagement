import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', iconOnly = false }) => {
  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight select-none cursor-pointer ${className}`}>
      <div className="relative w-7 h-7 rounded-lg bg-[var(--ink)] text-[var(--bg)] flex items-center justify-center font-mono text-xs font-bold shadow-xs">
        M
      </div>
      {!iconOnly && (
        <span className="text-lg font-bold text-[var(--ink)] tracking-tight font-sans">
          Mixkura
        </span>
      )}
    </div>
  );
};

