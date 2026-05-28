'use client';

import React, { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { clsx } from 'clsx';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Cari...',
  className
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={clsx('relative w-full select-none', className)}>
      <Search className="absolute left-3 top-2.5 text-text-tertiary w-3.5 h-3.5" />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 pl-9 pr-14 bg-bg-secondary border border-border rounded-md text-xs text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted"
      />
      <div className="absolute right-2 top-2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border bg-bg-tertiary text-[9px] text-text-tertiary font-mono pointer-events-none">
        <span className="text-[7px]">Ctrl</span>
        <span>K</span>
      </div>
    </div>
  );
};
export default SearchBar;
