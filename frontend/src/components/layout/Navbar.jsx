import React, { useState } from 'react';
import { Search, Bell, UserPlus, Menu, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onMenuClick, onOpenNewPatient, onOpenProfile }) {
  const { user, logout } = useAuth(); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

      {/* Acciones Rápidas y Perfil de Usuario */}
      <div className="flex items-center gap-2 md:gap-4 ml-4">
        
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all hidden sm:block">
          <Search className="w-5 h-5 sm:hidden" /> 
        </button>
        
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        
        <button 
          onClick={onOpenNewPatient}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Nuevo Paciente</span>
        </button>

        {/* Menú de Usuario (Dropdown) */}
        <div className="relative ml-1 md:ml-2 pl-2 md:pl-4 border-l border-slate-200">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-xl transition-colors outline-none"
          >
            <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-slate-700 leading-tight">{user?.name || 'Cargando...'}</p>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">Psicólogo(a)</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </button>

          {/* Panel Desplegable */}
          {isDropdownOpen && (
            <>
              {/* Fondo invisible para cerrar el menú al hacer clic afuera */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsDropdownOpen(false)}
              ></div>
              
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-1 z-50 animate-in fade-in slide-in-from-top-2">
                <button 
                  onClick={() => {
                    onOpenProfile(); // Llamamos a la función pasada desde MainLayout
                    setIsDropdownOpen(false);
                  }} 
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 w-full text-left transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" /> Mi Perfil
                </button>
                <hr className="border-slate-100 my-1" />
                <button 
                  onClick={logout} 
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 w-full text-left transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-400" /> Cerrar Sesión
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}