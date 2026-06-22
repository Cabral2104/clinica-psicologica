// Archivo: src/pages/analisis/AnalisisIA.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Loader2, AlertTriangle, ChevronRight, Activity, Calendar } from 'lucide-react';
import api from '../../services/api';

export default function AnalisisIA() {
  const [analisisList, setAnalisisList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // NUEVO: Estados para manejar la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalisis = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        // Se envía la página actual al backend
        const response = await api.get(`/analisis/historial?page=${currentPage}`);
        
        if (response.data && response.data.success) {
          // Extraemos los datos del arreglo paginado de Laravel
          setAnalisisList(response.data.data.data); 
          
          // Guardamos la metadata de las páginas
          setPaginationInfo({
            current_page: response.data.data.current_page,
            last_page: response.data.data.last_page,
            total: response.data.data.total
          });
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.error("Error al cargar análisis NLP:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalisis();
  }, [currentPage]); // Se vuelve a ejecutar cuando cambia la página

  const getEstiloTarjeta = (estrellas) => {
    if (estrellas >= 4) return { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'Positivo', iconBg: 'bg-emerald-100 text-emerald-600' };
    if (estrellas <= 2) return { border: 'border-rose-200 shadow-[0_0_15px_rgba(225,29,72,0.15)] ring-1 ring-rose-100', bg: 'bg-rose-50', text: 'text-rose-700', badge: 'Riesgo / Negativo', iconBg: 'bg-rose-100 text-rose-600 animate-pulse' };
    return { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-700', badge: 'Neutral', iconBg: 'bg-amber-100 text-amber-600' };
  };

  // Loader inicial a pantalla completa (solo cuando no hay datos aún)
  if (isLoading && analisisList.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
        <p className="text-slate-500 font-medium">Procesando motores de NLP...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm max-w-xl mx-auto mt-12">
        <div className="p-4 bg-rose-50 rounded-2xl text-rose-500"><AlertTriangle className="w-10 h-10" /></div>
        <h3 className="text-xl font-bold text-slate-800">Error al cargar el historial</h3>
        <p className="text-sm text-slate-500">Ocurrió un problema de conexión. Intenta nuevamente.</p>
        <button onClick={() => window.location.reload()} className="mt-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-rose-50 rounded-2xl text-rose-500">
            <HeartPulse className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Monitoreo IA (NLP)</h2>
            <p className="text-slate-500 font-medium mt-1">Análisis de sentimiento automatizado de notas clínicas</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {analisisList.length === 0 && !isLoading ? (
          <div className="bg-white p-12 rounded-[2rem] border border-slate-100 text-center">
            <p className="text-slate-500 font-medium">Aún no hay notas analizadas por la IA.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
            
            {/* Loader sutil al cambiar de página */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-[2rem]">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
              </div>
            )}

            {analisisList.map((item) => {
              const notaClinica = item.nota_clinica || {};
              const sesion = notaClinica.sesion || {};
              const paciente = sesion.paciente || {};
              const estilos = getEstiloTarjeta(item.estrellas);
              
              return (
                <div key={item.id} className={`bg-white rounded-[2rem] border p-6 flex flex-col justify-between transition-all hover:shadow-md ${estilos.border}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-slate-800">
                        {paciente?.nombre || 'Paciente Desconocido'} {paciente?.apellido_paterno || ''}
                      </h4>
                      <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3.5 h-3.5" /> 
                        {sesion?.fecha_sesion || item.created_at.split('T')[0]}
                      </p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${estilos.bg} ${estilos.text}`}>
                      <Activity className="w-3.5 h-3.5" />
                      <span>{estilos.badge}</span>
                    </div>
                  </div>

                  <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100 relative">
                    <div className="absolute -top-2 left-4 px-2 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Fragmento Analizado
                    </div>
                    <p className="text-sm font-medium text-slate-600 italic line-clamp-3 mt-1">
                      "{item.texto_analizado}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-lg ${estilos.iconBg}`}><HeartPulse className="w-4 h-4" /></div>
                       <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Precisión (Score)</p>
                         <p className={`text-sm font-bold ${estilos.text}`}>{(item.score * 100).toFixed(1)}% de seguridad</p>
                       </div>
                    </div>
                    {paciente?.id && (
                      <button 
                        onClick={() => navigate('/pacientes', { state: { openPatientId: paciente.id } })}
                        className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-slate-800 transition-colors"
                      >
                        Ir al expediente <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NUEVO: Controles Visuales de Paginación */}
      {paginationInfo.last_page > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-6 py-4 border border-slate-100 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] gap-4">
          <p className="text-sm font-medium text-slate-500 text-center sm:text-left">
            Mostrando página <span className="font-bold text-slate-700">{paginationInfo.current_page}</span> de <span className="font-bold text-slate-700">{paginationInfo.last_page}</span> 
            <span className="ml-2 hidden sm:inline">({paginationInfo.total} análisis totales)</span>
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={paginationInfo.current_page === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
            >
              Anterior
            </button>
            <button 
              disabled={paginationInfo.current_page === paginationInfo.last_page}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-4 py-2 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}