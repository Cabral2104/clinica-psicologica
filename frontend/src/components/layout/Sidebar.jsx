// Archivo: src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Users, Calendar, BrainCircuit, Activity, FileText, LineChart, X, LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  // Extraemos el objeto 'user' y la función 'logout' del contexto real
  const { user, logout } = useAuth(); 
  const closeSidebar = () => setIsOpen(false);

  // Obtenemos las iniciales del nombre del usuario de forma dinámica
  const getInitials = () => {
    if (!user) return 'U';
    const nameStr = user.name || user.nombre || 'Usuario';
    return nameStr.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-800/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={closeSidebar}
        ></div>
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50 flex flex-col transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 md:p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
              <BrainCircuit className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-800">
                Nexus<span className="text-teal-500">Salud</span>
              </h1>
              <p className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider text-slate-400">Plataforma Clínica</p>
            </div>
          </div>
          <button onClick={closeSidebar} className="md:hidden text-slate-400 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 md:px-6 overflow-y-auto space-y-6 custom-scrollbar">
          <div>
            <div className="space-y-1.5">
              <NavItem to="/dashboard" icon={<Home className="w-5 h-5" />} label="Resumen" onClick={closeSidebar} />
              <NavItem to="/pacientes" icon={<Users className="w-5 h-5" />} label="Pacientes" onClick={closeSidebar} />
              <NavItem to="/agenda" icon={<Calendar className="w-5 h-5" />} label="Agenda" onClick={closeSidebar} />
            </div>
          </div>
          <div>
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Módulos Clínicos</p>
            <div className="space-y-1.5">
              <NavItem to="/analisis-ia" icon={<Activity className="w-5 h-5" />} label="Análisis IA (NLP)" alert onClick={closeSidebar} />
              <NavItem to="/expedientes" icon={<FileText className="w-5 h-5" />} label="Expedientes" onClick={closeSidebar} />
              <NavItem to="/reportes" icon={<LineChart className="w-5 h-5" />} label="Reportes" onClick={closeSidebar} />
            </div>
          </div>
        </nav>

        {/* Perfil del Médico Dinámico */}
        <div className="p-4 md:p-6 mt-auto border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-slate-50 shadow-sm border border-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0 select-none">
                {getInitials()}
              </div>
              <div className="overflow-hidden">
                {/* Nombre real del usuario logueado */}
                <p className="text-sm font-bold text-slate-700 truncate">
                  {user?.name || user?.nombre || 'Especialista'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email || 'Cuenta Activa'}
                </p>
              </div>
            </div>
            <button 
              onClick={logout} 
              title="Cerrar Sesión"
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavItem({ to, icon, label, badge, alert, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => `
        w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all group
        ${isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
      `}
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            <div className={isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-500'}>
              {icon}
            </div>
            {label}
          </div>
          {badge && (
            <span className={`px-2.5 py-0.5 text-xs rounded-full font-bold ${
              alert ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
            }`}>
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}