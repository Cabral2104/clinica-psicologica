// Archivo: src/components/layout/Navbar.jsx
import React from 'react';
import { Search, Bell, UserPlus, Menu } from 'lucide-react';

export default function Navbar({ onMenuClick }) {
  return (
    <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-10">
      
      {/* Menú Hamburguesa (Solo Móvil) y Buscador */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="relative group w-full hidden sm:block">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar pacientes por nombre, diagnóstico..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="flex items-center gap-2 md:gap-4 ml-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all hidden sm:block">
          <Search className="w-5 h-5 sm:hidden" /> {/* Buscador icono para móvil si lo necesitas */}
        </button>
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
          <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Nuevo Paciente</span>
        </button>
      </div>
    </header>
  );
}