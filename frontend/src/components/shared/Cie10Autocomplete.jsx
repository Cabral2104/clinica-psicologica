import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import api from '../../services/api';

export default function Cie10Autocomplete({ onSelectAlternative }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2 || selectedItem) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/catalogos/cie10/buscar?q=${query}`);
        setSuggestions(response.data);
      } catch (error) {
        console.error("Error al buscar CIE-10:", error);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query, selectedItem]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    setSelectedItem(item);
    setQuery(`${item.codigo} - ${item.descripcion}`);
    setSuggestions([]);
    if (onSelectAlternative) onSelectAlternative(item);
  };

  const handleClear = () => {
    setSelectedItem(null);
    setQuery('');
    setSuggestions([]);
    if (onSelectAlternative) onSelectAlternative(null);
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
        Impresión Diagnóstica (CIE-10)
      </label>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          disabled={!!selectedItem}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ej: F41 o Ansiedad..."
          className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-teal-500 transition-all disabled:bg-teal-50/50 disabled:text-teal-900 disabled:font-medium disabled:border-teal-200"
        />
        {isLoading && <Loader2 className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-teal-500 animate-spin" />}
        {selectedItem && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar overflow-hidden divide-y divide-slate-50">
          {suggestions.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-5 py-3.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex gap-3"
              >
                <span className="font-bold text-teal-600 shrink-0">{item.codigo}</span>
                <span className="text-slate-600 truncate">{item.descripcion}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}