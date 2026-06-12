import React, { useState, useEffect } from 'react';
import { Search, Bell, UserPlus, Menu, User, LogOut, ChevronDown, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Navbar({ onMenuClick, onOpenNewPatient, onOpenProfile }) {
  const { user, logout } = useAuth(); 
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [hasUrgent, setHasUrgent] = useState(false);

  useEffect(() => {
    const fetchProximas = async () => {
      try {
        const response = await api.get('/sesiones/proximas');
        const sesiones = response.data.data || [];
        setUpcomingSessions(sesiones);

        // Función segura para obtener la fecha local en formato puro YYYY-MM-DD
        const getLocalYMD = (d) => {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const todayStr = getLocalYMD(new Date());
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = getLocalYMD(tomorrow);

        // Limpiamos la fecha que viene de Laravel antes de comparar
        const urgentes = sesiones.some(s => {
          if (!s.fecha_sesion) return false;
          const fechaLimpia = s.fecha_sesion.split('T')[0]; // Extrae solo "YYYY-MM-DD"
          return fechaLimpia === todayStr || fechaLimpia === tomorrowStr;
        });

        setHasUrgent(urgentes);
      } catch (error) {
        console.error("Error cargando próximas sesiones:", error);
      }
    };

    if (user) {
      fetchProximas();
    }
  }, [user]);

  const formatNotificationDate = (dateString) => {
    if (!dateString) return '';
    
    // 1. Limpiamos cualquier rastro de horas/zonas que envíe Laravel
    const fechaLimpia = dateString.split('T')[0]; 

    // 2. Calculamos Hoy y Mañana localmente
    const getLocalYMD = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const todayStr = getLocalYMD(new Date());
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getLocalYMD(tomorrow);

    // 3. Comparamos fechas puras
    if (fechaLimpia === todayStr) return 'Hoy';
    if (fechaLimpia === tomorrowStr) return 'Mañana';

    // 4. Formateamos seguro: agregamos T12:00:00 para evitar que 
    // la zona horaria le reste un día accidentalmente al renderizar
    const dateObj = new Date(fechaLimpia + 'T12:00:00'); 
    return dateObj.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  };

  return (
    <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-10">
      
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

      <div className="flex items-center gap-2 md:gap-4 ml-4">
        
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all hidden sm:block">
          <Search className="w-5 h-5 sm:hidden" /> 
        </button>
        
        {/* LA CAMPANITA */}
        <div className="relative">
          <button 
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsDropdownOpen(false);
            }}
            className={`relative p-2 rounded-xl transition-all ${isNotificationsOpen ? 'bg-teal-50 text-teal-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <Bell className="w-5 h-5" />
            {hasUrgent && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                
                <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600" /> Próximas Citas
                  </h3>
                  <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                    {upcomingSessions.length} programadas
                  </span>
                </div>
                
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {upcomingSessions.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell className="w-5 h-5 text-slate-300" />
                      </div>
                      <p className="text-sm font-medium text-slate-500">No hay citas en tu agenda.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {upcomingSessions.map(sesion => (
                        <div key={sesion.id} className="p-4 hover:bg-slate-50 transition-colors cursor-default group">
                          <p className="text-sm font-bold text-slate-700 group-hover:text-teal-700 transition-colors">
                            {sesion.paciente?.nombre} {sesion.paciente?.apellido_paterno}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                              formatNotificationDate(sesion.fecha_sesion) === 'Hoy' 
                                ? 'bg-rose-50 text-rose-600' 
                                : formatNotificationDate(sesion.fecha_sesion) === 'Mañana'
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {formatNotificationDate(sesion.fecha_sesion)}
                            </span>
                            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> 
                              {sesion.hora_inicio ? sesion.hora_inicio.substring(0,5) : 'Por definir'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="p-3 border-t border-slate-100 bg-white">
                  <button className="w-full py-2 text-xs font-bold text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors">
                    Ver agenda completa
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <button 
          onClick={onOpenNewPatient}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Nuevo Paciente</span>
        </button>

        {/* Dropdown de Usuario */}
        <div className="relative ml-1 md:ml-2 pl-2 md:pl-4 border-l border-slate-200">
          <button 
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              setIsNotificationsOpen(false);
            }}
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

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-1 z-50 animate-in fade-in slide-in-from-top-2">
                <button 
                  onClick={() => {
                    onOpenProfile(); 
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