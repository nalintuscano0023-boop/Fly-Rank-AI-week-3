import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search delicious recipes by name (e.g. Chicken, Pasta, Curry)...',
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to quickly focus the search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        // Only trigger if user is not in another input or textarea
        const targetTag = (e.target as HTMLElement)?.tagName;
        if (targetTag !== 'INPUT' && targetTag !== 'TEXTAREA') {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="search-bar-wrapper">
      <label htmlFor="recipe-search-input" className="sr-only">
        Search recipes
      </label>
      <div className="search-input-container">
        <Search className="search-icon" size={20} aria-hidden="true" />
        <input
          ref={inputRef}
          id="recipe-search-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="search-input"
          aria-label="Search recipes by name"
        />
        {value ? (
          <button
            type="button"
            className="clear-search-btn"
            onClick={handleClear}
            aria-label="Clear search query"
          >
            <X size={16} aria-hidden="true" />
          </button>
        ) : (
          <kbd className="search-shortcut" title="Press / to search">
            /
          </kbd>
        )}
      </div>
    </div>
  );
};
