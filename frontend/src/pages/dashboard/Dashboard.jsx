// Archivo: src/pages/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  HeartPulse, 
  TrendingUp,
  Activity,
  ChevronLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext'; 

export default function Dashboard() {
  const { user } = useAuth(); 
  // Ahora el estado inicial de todas las métricas es 0
  const [metrics, setMetrics] = useState({ activePatients: 0, sessionsToday: 0, nlpAlerts: 0 });
  const [patientsList, setPatientsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Obtenemos todos los pacientes
        const response = await api.get('/pacientes');
        const allPatients = response.data?.data || [];
        
        // Variables para los cálculos dinámicos
        let totalSessionsToday = 0;
        let totalNlpAlerts = 0;
        const todayStr = new Date().toISOString().split('T')[0];

        // 2. Por cada paciente, buscamos sus sesiones para armar el panel
        // (Nota: En un entorno de producción masivo esto se haría en el backend con una ruta global,
        // pero esta solución funciona perfecto para conectar tu API actual)
        await Promise.all(allPatients.map(async (paciente) => {
           try {
             const sesionRes = await api.get(`/pacientes/${paciente.id}/sesiones`);
             const sesiones = sesionRes.data?.data || [];
             
             sesiones.forEach(sesion => {
                // Contar sesiones de hoy
                // (Asegúrate de que el campo de fecha en tu BD se llame 'fecha_sesion' o ajústalo aquí)
                const fechaSesion = sesion.fecha_sesion || sesion.created_at?.split('T')[0];
                if (fechaSesion === todayStr) {
                   totalSessionsToday++;
                }

                // Contar alertas de IA
                // (Ajusta la ruta de la relación según cómo la devuelva tu SesionController)
                const polaridad = sesion.nota_clinica?.analisis_sentimiento?.polaridad;
                const score = sesion.nota_clinica?.analisis_sentimiento?.score;
                
                if (polaridad === 'Negativa' || (score !== undefined && score < -0.5)) {
                   totalNlpAlerts++;
                }
             });
           } catch (err) {
             console.warn(`No se pudieron cargar las sesiones del paciente ${paciente.id}`);
           }
        }));

        // 3. Actualizamos todas las métricas dinámicamente
        setMetrics({ 
          activePatients: allPatients.length,
          sessionsToday: totalSessionsToday,
          nlpAlerts: totalNlpAlerts
        });
        
        setPatientsList(allPatients);

      } catch (err) {
        console.error("Error al cargar datos del Dashboard:", err);
        setError("No se pudieron sincronizar los datos. Verifica que el token sea válido.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
        <p className="text-slate-500 font-medium text-sm animate-pulse">Sincronizando expediente clínico y motor de IA...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 bg-rose-50 border border-rose-200 p-6 rounded-[2rem] text-center space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Error de comunicación</h3>
        <p className="text-sm text-slate-600 font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-100/50 transition-colors"
        >
          Reintentar conexión
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
            Bienvenido, {user?.name || user?.nombre || 'Especialista'}
          </h2>
          <p className="text-slate-500 mt-1 flex items-center gap-2 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block animate-pulse"></span>
            Turno Clínico Activo • Conectado a la Base de Datos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Pacientes Activos" 
          value={metrics.activePatients} 
          icon={<Users className="w-6 h-6 text-blue-500" />}
          bgIcon="bg-blue-50"
          subtitle="Registrados en la plataforma"
        />
        <MetricCard 
          title="Sesiones de Hoy" 
          value={metrics.sessionsToday} 
          icon={<Calendar className="w-6 h-6 text-teal-500" />}
          bgIcon="bg-teal-50"
          subtitle="Consultas programadas"
        />
        <div className="bg-white p-6 rounded-[2rem] border border-rose-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between group transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-[100px] -z-10 transition-transform duration-500 group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Atención IA (NLP)</p>
            <div className="p-3 bg-rose-50 rounded-2xl text-rose-500 group-hover:bg-rose-100 transition-colors">
              <HeartPulse className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black text-slate-800">{metrics.nlpAlerts}</h3>
              <span className="text-sm font-bold text-rose-500">alertas</span>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-2">Indicadores de riesgo detectados en notas.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Directorio de Pacientes</h3>
          </div>
          
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            {patientsList.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium text-sm">
                No hay pacientes registrados aún en la base de datos.
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {patientsList.map((paciente) => (
                  <div 
                    key={paciente.id} 
                    className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-center gap-6 group cursor-pointer"
                  >
                    <div className="flex items-center gap-4 flex-1 w-full">
                      <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center font-bold text-teal-700 text-xl border border-white shadow-sm">
                        {paciente.nombre?.substring(0,2).toUpperCase() || 'P'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-lg group-hover:text-teal-600 transition-colors">
                          {paciente.nombre} {paciente.apellido_paterno}
                        </p>
                        <p className="text-sm font-medium text-slate-500">{paciente.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 w-full sm:w-auto mt-4 sm:mt-0 gap-2">
                       <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg">
                          Activo
                       </span>
                    </div>
                    
                    <div className="hidden sm:block text-slate-300 group-hover:text-teal-500 transition-transform group-hover:translate-x-1">
                      <ChevronLeft className="w-6 h-6 rotate-180" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Evolución Semanal</h3>
          </div>
          
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[calc(100%-3rem)] flex flex-col">
            <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
              Distribución analítica del estado de ánimo.
            </p>
            
            <div className="flex-1 flex items-end justify-between gap-3 mb-8 pt-10">
               <div className="w-full bg-slate-50 rounded-t-xl h-24 relative group">
                  <div className="absolute bottom-0 w-full bg-teal-400 rounded-t-xl h-[65%] transition-all duration-300 group-hover:bg-teal-500"></div>
                  <span className="absolute -bottom-7 w-full text-center text-xs font-bold text-slate-400">Sem 1</span>
               </div>
               <div className="w-full bg-slate-50 rounded-t-xl h-32 relative group">
                  <div className="absolute bottom-0 w-full bg-teal-400 rounded-t-xl h-[50%] transition-all duration-300 group-hover:bg-teal-500"></div>
                  <span className="absolute -bottom-7 w-full text-center text-xs font-bold text-slate-400">Sem 2</span>
               </div>
               <div className="w-full bg-slate-50 rounded-t-xl h-40 relative group">
                  <div className="absolute bottom-0 w-full bg-emerald-400 rounded-t-xl h-[75%] transition-all duration-300 group-hover:bg-emerald-500"></div>
                  <span className="absolute -bottom-7 w-full text-center text-xs font-bold text-slate-400">Sem 3</span>
               </div>
               <div className="w-full bg-slate-50 rounded-t-xl h-48 relative group">
                  <div className="absolute bottom-0 w-full bg-emerald-400 rounded-t-xl h-[85%] transition-all duration-300 group-hover:bg-emerald-500"></div>
                  <span className="absolute -bottom-7 w-full text-center text-xs font-bold text-slate-400">Sem 4</span>
               </div>
            </div>
            
            <div className="mt-auto pt-6 border-t border-slate-100">
               <div className="flex items-center gap-4">
                 <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                   <TrendingUp className="w-6 h-6" />
                 </div>
                 <div>
                   <p className="text-base font-bold text-slate-800">Monitoreo Activo</p>
                   <p className="text-sm font-medium text-slate-500">Módulo de salud mental NexusSalud v1.0</p>
                 </div>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, subtitle, bgIcon }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between group transition-colors">
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        <div className={`p-3 rounded-2xl ${bgIcon}`}>
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-4xl font-black text-slate-800">{value}</h3>
        {subtitle && <p className="text-sm font-medium text-slate-500 mt-2">{subtitle}</p>}
      </div>
    </div>
  );
}