import React, { useState, useEffect } from 'react';
import { Users, CalendarCheck, Activity, BarChart3, Loader2, AlertTriangle, BrainCircuit, ChevronLeft, ChevronRight, FileText, Table } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import api from '../../services/api';

export default function Reportes() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  // Nuevo estado para la carga del CSV total
  const [isExportingCSV, setIsExportingCSV] = useState(false);

  const [recentPatients, setRecentPatients] = useState([]);
  const [recentPage, setRecentPage] = useState(1);
  const [recentLastPage, setRecentLastPage] = useState(1);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/reportes/dashboard');
        if (response.data.success) {
          setStats(response.data.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error al cargar reportes:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchRecentPatients = async () => {
      setIsLoadingRecent(true);
      try {
        const response = await api.get(`/reportes/pacientes-recientes?page=${recentPage}`);
        if (response.data.success) {
          setRecentPatients(response.data.data.data);
          setRecentLastPage(response.data.data.last_page);
        }
      } catch (err) {
        console.error("Error al cargar pacientes recientes:", err);
      } finally {
        setIsLoadingRecent(false);
      }
    };
    fetchRecentPatients();
  }, [recentPage]);

  const BAR_COLORS = ['#0f766e', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4'];
  const GENDER_COLORS = ['#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#cbd5e1'];
  const NLP_COLORS = { 'Positivo': '#10b981', 'Neutral': '#f59e0b', 'Riesgo': '#f43f5e' };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // ==========================================
  // FUNCIONES DE EXPORTACIÓN
  // ==========================================

  // Exportar a PDF (Generado desde Laravel)
  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const response = await api.get('/reportes/exportar-pdf', {
        responseType: 'blob', 
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Estadistico_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar reporte PDF:", error);
      alert("Hubo un problema al generar el documento PDF desde el servidor.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Convertidor universal a CSV
  const downloadCSV = (data, filename, headers) => {
    if (!data || data.length === 0) return alert("No hay datos para exportar.");
    
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
      const values = Object.values(row).map(val => {
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // NUEVO: Exportar TODOS los pacientes a CSV
  const handleExportAllPatientsCSV = async () => {
    setIsExportingCSV(true);
    try {
      const response = await api.get('/reportes/pacientes-todos');
      if (response.data.success) {
        const exportData = response.data.data.map(p => ({
           ID: p.id,
           Nombre: p.nombre,
           Apellidos: `${p.apellido_paterno} ${p.apellido_materno || ''}`.trim(),
           Registro: formatDate(p.created_at)
        }));
        downloadCSV(exportData, `Total_Pacientes_Clinica`, ['ID', 'Nombre', 'Apellidos', 'Fecha_Registro']);
      }
    } catch (error) {
      console.error("Error al exportar pacientes:", error);
      alert("Hubo un problema al obtener los datos completos para el CSV.");
    } finally {
      setIsExportingCSV(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-10 h-10 text-teal-500 animate-spin" /></div>;
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center">
        <AlertTriangle className="w-16 h-16 text-rose-400 mb-4" />
        <h3 className="text-xl font-bold text-slate-700">Error al cargar datos</h3>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Encabezado con Botón Global de Exportación PDF */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center border border-teal-100">
            <BarChart3 className="w-7 h-7 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Panel de Reportes</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Radiografía operativa, demográfica y analítica de tu clínica.</p>
          </div>
        </div>
        
        <button 
          onClick={handleExportPDF}
          disabled={isExportingPDF}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-colors shadow-sm disabled:opacity-70"
        >
          {isExportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          {isExportingPDF ? 'Generando PDF...' : 'Exportar Dashboard'}
        </button>
      </div>

      <div className="space-y-6 bg-slate-50/50 p-2 md:p-0 rounded-3xl">
        
        {/* KPIs Superiores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50"></div>
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 relative z-10"><Users className="w-7 h-7" /></div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Pacientes Activos</p>
              <p className="text-3xl font-black text-slate-800">{stats.kpis.total_pacientes}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-50 rounded-full opacity-50"></div>
            <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center shrink-0 relative z-10"><CalendarCheck className="w-7 h-7" /></div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total de Sesiones</p>
              <p className="text-3xl font-black text-slate-800">{stats.kpis.total_sesiones}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full opacity-50"></div>
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 relative z-10"><Activity className="w-7 h-7" /></div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Sesiones este mes</p>
              <p className="text-3xl font-black text-slate-800">{stats.kpis.sesiones_mes}</p>
            </div>
          </div>
        </div>

        {/* Gráficas Intermedias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[380px]">
            <div className="mb-4 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Morbilidad Frecuente</h3>
                <p className="text-sm text-slate-500">Los 5 diagnósticos más comunes.</p>
              </div>
              <button 
                onClick={() => downloadCSV(stats.top_diagnosticos, 'Top_Diagnosticos', ['Codigo CIE-10', 'Diagnostico', 'Total Casos'])}
                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Exportar CSV"
              >
                <Table className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 w-full">
              {stats.top_diagnosticos?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.top_diagnosticos} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="codigo_cie" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} dy={10} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value, name, props) => [value, props.payload.nombre_diagnostico]} labelStyle={{ display: 'none' }} />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={50}>
                      {stats.top_diagnosticos.map((entry, index) => <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="flex h-full items-center justify-center text-slate-400 text-sm font-medium">Sin datos suficientes.</div>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[380px]">
            <div className="mb-2 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Termómetro NLP</h3>
                <p className="text-sm text-slate-500">Sentimiento general detectado.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => downloadCSV(stats.nlp_stats, 'Analisis_IA', ['Sentimiento', 'Total Notas'])}
                  className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Exportar CSV"
                >
                  <Table className="w-5 h-5" />
                </button>
                <div className="p-2 bg-teal-50 rounded-xl"><BrainCircuit className="w-5 h-5 text-teal-600"/></div>
              </div>
            </div>
            <div className="flex-1 w-full">
               {stats.nlp_stats?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.nlp_stats} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value">
                      {stats.nlp_stats.map((entry, index) => <Cell key={`cell-${index}`} fill={NLP_COLORS[entry.name] || '#cbd5e1'} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                    <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                  </PieChart>
                </ResponsiveContainer>
               ) : <div className="flex h-full items-center justify-center text-slate-400 text-sm font-medium">No hay análisis procesados aún.</div>}
            </div>
          </div>
        </div>

        {/* Sección Inferior: Demografía y Lista de Pacientes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[400px] lg:col-span-1">
            <div className="mb-2 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Demografía</h3>
                <p className="text-sm text-slate-500">Distribución por género.</p>
              </div>
              <button 
                onClick={() => downloadCSV(stats.genero_stats, 'Demografia_Genero', ['Genero', 'Total'])}
                className="p-1 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Exportar CSV"
              >
                <Table className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 w-full">
              {stats.genero_stats?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.genero_stats} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}>
                      {stats.genero_stats.map((entry, index) => <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                    <Legend verticalAlign="bottom" height={20} iconType="circle"/>
                  </PieChart>
                </ResponsiveContainer>
               ) : <div className="flex h-full items-center justify-center text-slate-400 text-sm font-medium">Sin datos demográficos.</div>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[400px] lg:col-span-2">
            <div className="mb-4 flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Últimos Ingresos</h3>
                <p className="text-sm text-slate-500">Pacientes dados de alta en el sistema.</p>
              </div>
              
              <div className="flex items-center gap-3">
                
                {/* BOTÓN ACTUALIZADO PARA DESCARGAR TODOS LOS PACIENTES */}
                <button 
                  onClick={handleExportAllPatientsCSV}
                  disabled={isExportingCSV}
                  className="mr-2 p-1.5 bg-slate-100 text-slate-600 hover:text-teal-700 hover:bg-teal-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold disabled:opacity-50" 
                  title="Exportar TODOS los pacientes a CSV"
                >
                  {isExportingCSV ? <Loader2 className="w-4 h-4 animate-spin" /> : <Table className="w-4 h-4" />} CSV
                </button>

                {recentLastPage > 1 && (
                  <>
                    <button onClick={() => setRecentPage(p => Math.max(1, p - 1))} disabled={recentPage === 1} className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                    <span className="text-xs font-bold text-slate-400">Pág {recentPage} de {recentLastPage}</span>
                    <button onClick={() => setRecentPage(p => Math.min(recentLastPage, p + 1))} disabled={recentPage === recentLastPage} className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 relative">
               {isLoadingRecent ? (
                 <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>
               ) : null}

               {recentPatients?.length > 0 ? (
                 recentPatients.map((paciente) => (
                   <div key={paciente.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-100 hover:bg-teal-50/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center shrink-0">
                          {paciente.nombre.charAt(0)}{paciente.apellido_paterno?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">{paciente.nombre} {paciente.apellido_paterno}</p>
                          <p className="text-xs text-slate-500 font-medium">Expediente: #{paciente.id.toString().padStart(4, '0')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registrado el</p>
                        <p className="text-sm font-medium text-slate-600">{formatDate(paciente.created_at)}</p>
                      </div>
                   </div>
                 ))
               ) : (
                 !isLoadingRecent && <div className="h-full flex flex-col items-center justify-center text-center"><p className="text-slate-400 font-medium">Aún no tienes pacientes registrados.</p></div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}