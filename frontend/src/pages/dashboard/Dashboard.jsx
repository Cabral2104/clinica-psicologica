// Archivo: src/pages/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, Calendar as CalendarIcon, HeartPulse, ChevronRight, Loader2, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setHasError(false);
        const response = await api.get('/dashboard/resumen');
        if (response.data && response.data.success) {
          setData(response.data.data);
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.error("Error al cargar el dashboard:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
        <p className="text-slate-500 font-medium">Cargando métricas de tu clínica...</p>
      </div>
    );
  }

  // Si hubo un error en el servidor, mostramos una tarjeta elegante en lugar de colapsar la app
  if (hasError || !data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm max-w-xl mx-auto mt-12">
        <div className="p-4 bg-rose-50 rounded-2xl text-rose-500">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Error de conexión con el servidor</h3>
        <p className="text-sm text-slate-500 max-w-md">
          No se pudieron cargar las métricas. Esto ocurre si hay un problema en las consultas del controlador o si falta alguna columna en la base de datos. Revisa la consola o tu archivo laravel.log.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
        >
          Reintentar cargar
        </button>
      </div>
    );
  }

  const { metricas, pacientes_recientes, evolucion } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Saludo */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          Bienvenido, {user?.name || 'Doctor(a)'}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <p className="text-sm font-medium text-slate-500">
            Turno Clínico Activo • Conectado a la Base de Datos
          </p>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tarjeta 1 */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pacientes Activos</h3>
            <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl"><Users className="w-5 h-5" /></div>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-800">{metricas?.pacientes_activos ?? 0}</p>
            <p className="text-sm font-medium text-slate-500 mt-1">Registrados en la plataforma</p>
          </div>
        </div>

        {/* Tarjeta 2 */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sesiones de Hoy</h3>
            <div className="p-2.5 bg-teal-50 text-teal-500 rounded-xl"><CalendarIcon className="w-5 h-5" /></div>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-800">{metricas?.sesiones_hoy ?? 0}</p>
            <p className="text-sm font-medium text-slate-500 mt-1">Consultas programadas para hoy</p>
          </div>
        </div>

        {/* Tarjeta 3 */}
        <div className="bg-white p-6 rounded-[2rem] border border-rose-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl group-hover:bg-rose-100 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Atención IA (NLP)</h3>
            <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl"><HeartPulse className="w-5 h-5" /></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-slate-800">{metricas?.alertas_ia ?? 0}</p>
              <span className="text-sm font-bold text-rose-500">alertas</span>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-1">Indicadores de riesgo detectados</p>
          </div>
        </div>

      </div>

      {/* Sección Inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lista de Acceso Rápido */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 ml-2">Directorio Reciente</h2>
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            {pacientes_recientes && pacientes_recientes.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {pacientes_recientes.map((paciente) => (
                  <div 
                    key={paciente.id} 
                    onClick={() => navigate('/pacientes', { state: { openPatientId: paciente.id } })}
                    className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Uso defensivo de substring */}
                      <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center font-bold text-teal-700 border border-teal-100">
                        {paciente?.nombre ? paciente.nombre.substring(0,2).toUpperCase() : 'P'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 group-hover:text-teal-600 transition-colors">
                          {paciente?.nombre} {paciente?.apellido_paterno}
                        </h4>
                        <p className="text-xs font-medium text-slate-500">{paciente?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {paciente?.status === 1 || paciente?.status === true ? (
                        <span className="hidden sm:inline-flex px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider rounded-lg">Activo</span>
                      ) : (
                        <span className="hidden sm:inline-flex px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-bold uppercase tracking-wider rounded-lg">Inactivo</span>
                      )}
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 font-medium">Aún no hay pacientes registrados.</div>
            )}
          </div>
        </div>

        {/* Gráfica Evolutiva */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 ml-2">Evolución Semanal</h2>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[300px] flex flex-col">
            <p className="text-sm font-medium text-slate-500 mb-6">Distribución analítica del estado de ánimo general.</p>
            
            <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 mt-auto">
              {evolucion?.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1 group cursor-default">
                  <div className="w-full relative flex items-end justify-center h-40 bg-slate-50 rounded-t-xl overflow-hidden">
                    <div 
                      className="w-full bg-teal-400 group-hover:bg-teal-500 transition-all duration-500 ease-out rounded-t-xl"
                      style={{ height: `${item.porcentaje}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{item?.semana}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500"><TrendingUp className="w-4 h-4" /></div>
              <div>
                <p className="text-xs font-bold text-slate-800">Monitoreo Activo</p>
                <p className="text-[10px] text-slate-500">Módulo NexusSalud v1.0</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}