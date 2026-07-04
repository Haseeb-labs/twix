import { useState, useEffect } from 'react';

const SearchIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" className={`w-5 h-5 fill-current shrink-0 ${active ? 'text-twitter' : 'text-gray-500'}`}>
    <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.814 5.272l4.521 4.521-.707.707-4.52-4.52C7.272 21.319 5.442 22 3.457 22H3.25c-4.694 0-8.5-3.806-8.5-8.5V13v-.25z" />
  </svg>
);

const ClearIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z" />
  </svg>
);

export default function SearchBar({ onSearch, placeholder = 'Search' }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => onSearch(value.trim()), 400);
    return () => clearTimeout(id);
  }, [value, onSearch]);

  const clear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-full transition-colors ${
        focused
          ? 'bg-black border border-twitter'
          : 'bg-gray-900 border border-transparent'
      }`}
    >
      <SearchIcon active={focused} />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-white placeholder-gray-500 text-[15px] focus:outline-none"
      />
      {value && (
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={clear}
          className="text-twitter hover:opacity-80 transition-opacity"
        >
          <ClearIcon />
        </button>
      )}
    </div>
  );
}
