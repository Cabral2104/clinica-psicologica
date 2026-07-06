import React, { useState, useEffect } from 'react';
import { 
  Users, Search, FileText, Phone, Activity, Calendar, 
  Clock, ShieldAlert, HeartPulse, Loader2, ChevronRight, Download, ChevronLeft, AlertTriangle
} from 'lucide-react';
import api from '../../services/api';

export default function Expedientes() {
  const [patients, setPatients] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({});

  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [expediente, setExpediente] = useState(null);
  const [isLoadingExpediente, setIsLoadingExpediente] = useState(false);
  const [errorExpediente, setErrorExpediente] = useState(false); 
  const [activeTab, setActiveTab] = useState('general');
  
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); 
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoadingList(true);
      try {
        const response = await api.get(`/pacientes?page=${currentPage}&search=${debouncedSearch}`);
        const items = response.data?.data || [];
        setPatients(Array.isArray(items) ? items : []);

        if (response.data?.meta) {
          setPaginationInfo({
            current_page: response.data.meta.current_page,
            last_page: response.data.meta.last_page,
            total: response.data.meta.total
          });
        }
      } catch (error) {
        console.error("Error al cargar pacientes:", error);
        setPatients([]);
      } finally {
        setIsLoadingList(false);
      }
    };
    fetchPatients();
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    if (!selectedPatientId) return;

    const fetchExpediente = async () => {
      setIsLoadingExpediente(true);
      setErrorExpediente(false); 
      try {
        const response = await api.get(`/pacientes/${selectedPatientId}/expediente`);
        if (response.data.success) {
          setExpediente(response.data.data);
          setActiveTab('general');
        } else {
          setErrorExpediente(true);
        }
      } catch (error) {
        console.error("Error al cargar el expediente:", error);
        setErrorExpediente(true); 
      } finally {
        setIsLoadingExpediente(false);
      }
    };

    fetchExpediente();
  }, [selectedPatientId]);

  const formatShortDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString.split('T')[0] + 'T00:00:00');
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'N/A';
    const hoy = new Date();
    const cumpleanos = new Date(fechaNacimiento.split('T')[0]);
    let edad = hoy.getFullYear() - cumpleanos.getFullYear();
    const m = hoy.getMonth() - cumpleanos.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
        edad--;
    }
    return edad;
  };

  const handleExportPDF = async () => {
    if (!selectedPatientId || !expediente) return;
    
    setIsExporting(true);
    try {
      const response = await api.get(`/pacientes/${selectedPatientId}/exportar-pdf`, {
        responseType: 'blob', 
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Expediente_${expediente.nombre.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      alert("Hubo un problema al generar el PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  // Función exclusiva para Diagnósticos (con validación de campos obligatorios para evitar 422)
  const toggleStatusDiagnostico = async (diagnostico) => {
    console.log("Intentando actualizar diagnóstico ID:", diagnostico.id); // <--- REVISA ESTO EN CONSOLA
    try {
      const nuevoStatus = !diagnostico.status; 
      
      // Asegúrate de que esta URL coincida con la ruta definida en api.php
      const response = await api.put(`/pacientes/${expediente.id}/diagnosticos/${diagnostico.id}`, {
        codigo_cie: diagnostico.codigo_cie,
        nombre_diagnostico: diagnostico.nombre_diagnostico,
        descripcion: diagnostico.descripcion || '',
        status: nuevoStatus
      });

      if (response.status === 200) {
        setExpediente({
          ...expediente,
          diagnosticos: expediente.diagnosticos.map(d => 
            d.id === diagnostico.id ? { ...d, status: nuevoStatus } : d
          )
        });
        console.log("Diagnóstico actualizado con éxito");
      }
    } catch (error) {
      console.error("Error al actualizar el estado del diagnóstico:", error);
      alert("Hubo un error al actualizar. Revisa la consola.");
    }
  };

  const contactoPrincipal = expediente?.contactos_emergencia?.length > 0 
    ? expediente.contactos_emergencia[0] 
    : null;

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      
      {/* PANEL IZQUIERDO: LISTA MAESTRA PAGINADA */}
      <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden shrink-0 h-[40vh] lg:h-full">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
            <FileText className="w-6 h-6 text-teal-500" /> Expedientes
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar en base de datos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-teal-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {isLoadingList ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>
          ) : patients.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-10">No se encontraron pacientes.</p>
          ) : (
            patients.map(paciente => (
              <button
                key={paciente.id}
                onClick={() => setSelectedPatientId(paciente.id)}
                className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between group ${
                  selectedPatientId === paciente.id 
                    ? 'bg-teal-50 border border-teal-100' 
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div>
                  <h4 className={`font-bold ${selectedPatientId === paciente.id ? 'text-teal-700' : 'text-slate-700'}`}>
                    {paciente.nombre} {paciente.apellido_paterno}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Exp: #{paciente.id.toString().padStart(4, '0')}</p>
                </div>
                <ChevronRight className={`w-4 h-4 ${selectedPatientId === paciente.id ? 'text-teal-500' : 'text-slate-300 group-hover:text-slate-400'}`} />
              </button>
            ))
          )}
        </div>

        {paginationInfo.last_page > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
             <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-colors"
             >
               <ChevronLeft className="w-5 h-5" />
             </button>
             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
               Pág {currentPage} de {paginationInfo.last_page}
             </span>
             <button 
                disabled={currentPage === paginationInfo.last_page}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-colors"
             >
               <ChevronRight className="w-5 h-5" />
             </button>
          </div>
        )}
      </div>

      {/* PANEL DERECHO: DETALLE DEL EXPEDIENTE */}
      <div className="flex-1 bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden h-[60vh] lg:h-full">
        {!selectedPatientId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">Selecciona un Expediente</h3>
            <p className="text-slate-500 mt-2 max-w-sm">Haz clic en un paciente de la lista para visualizar su historial clínico, diagnósticos y reportes.</p>
          </div>
        ) : errorExpediente ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <AlertTriangle className="w-16 h-16 text-rose-400 mb-4" />
            <h3 className="text-xl font-bold text-slate-700">Error en el Servidor</h3>
            <p className="text-slate-500 mt-2 max-w-sm">Hubo un problema al cargar los datos. Revisa la consola o asegúrate de que las tablas relacionadas existan en tu base de datos.</p>
          </div>
        ) : isLoadingExpediente || !expediente ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center font-black text-2xl text-teal-700 border border-teal-100 shrink-0">
                  {expediente.nombre.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {expediente.nombre} {expediente.apellido_paterno} {expediente.apellido_materno}
                  </h2>
                  <div className="flex items-center flex-wrap gap-2 md:gap-3 mt-1 text-sm font-medium text-slate-500">
                    <span>{calcularEdad(expediente.fecha_nacimiento)} años</span>
                    <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <span className="capitalize">{expediente.genero?.valor || expediente.genero?.nombre || 'Sin especificar'}</span>
                    <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <span>Ingreso: {formatShortDate(expediente.created_at)}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shrink-0 disabled:opacity-70"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isExporting ? 'Generando...' : 'Exportar PDF'}
              </button>
            </div>

            <div className="flex overflow-x-auto custom-scrollbar border-b border-slate-100 px-6 md:px-8">
              {[
                { id: 'general', label: 'Datos Generales', icon: <Users className="w-4 h-4" /> },
                { id: 'diagnosticos', label: 'Diagnósticos', icon: <Activity className="w-4 h-4" /> },
                { id: 'historial', label: 'Historial Clínico', icon: <Clock className="w-4 h-4" /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'border-teal-500 text-teal-600' 
                      : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-slate-50/30">
              
              {activeTab === 'general' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Información de Contacto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase">Teléfono Móvil</p>
                        <p className="text-slate-800 font-medium mt-1">{expediente.telefono || 'No registrado'}</p>
                      </div>
                      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase">Correo Electrónico</p>
                        <p className="text-slate-800 font-medium mt-1">{expediente.email || 'No registrado'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400" /> Contactos de Emergencia
                    </h3>
                    {contactoPrincipal ? (
                      <div className="p-5 bg-rose-50/50 rounded-2xl border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-rose-800 font-bold">{contactoPrincipal.nombre_completo}</p>
                          <p className="text-sm text-rose-600 font-medium mt-0.5">Parentesco: {contactoPrincipal.parentesco}</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-rose-100 shadow-sm">
                          <Phone className="w-4 h-4 text-rose-500" />
                          <span className="font-bold text-slate-700">{contactoPrincipal.telefono}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 bg-white p-4 rounded-xl border border-slate-100">Sin contactos de emergencia registrados.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'diagnosticos' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  {expediente.diagnosticos?.length > 0 ? (
                    <div className="space-y-4">
                      {expediente.diagnosticos.map(diag => (
                        <div key={diag.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${diag.status ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400'}`}>
                            <Activity className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="font-bold text-slate-800">{diag.codigo_cie} - {diag.nombre_diagnostico}</h4>
                              
                              <button
                                onClick={() => toggleStatusDiagnostico(diag)}
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-md cursor-pointer transition-colors shadow-sm ${
                                  diag.status 
                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200' 
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                                }`}
                                title="Clic para cambiar el estado"
                              >
                                {diag.status ? 'ACTIVO' : 'RESUELTO'}
                              </button>
                            </div>
                            <p className="text-sm text-slate-600 mt-2">{diag.descripcion}</p>
                            <p className="text-xs font-bold text-slate-400 mt-3 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" /> Diagnosticado el: {formatShortDate(diag.fecha_diagnostico || diag.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-slate-500 font-medium">No hay diagnósticos formales en el expediente.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'historial' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  {expediente.sesiones?.length > 0 ? (
                    <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-8 py-2">
                      {expediente.sesiones.map(sesion => {
                        const nota = sesion.nota || sesion.nota_clinica;
                        const nlp = nota?.analisis_sentimiento || nota?.analisisSentimiento;
                        
                        return (
                          <div key={sesion.id} className="relative">
                            <span className="absolute -left-[35px] top-1 w-4 h-4 rounded-full bg-white border-4 border-teal-500 shadow-sm"></span>
                            
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                              <div className="flex flex-wrap justify-between items-start mb-3 gap-2">
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md inline-block">
                                      Sesión #{sesion.numero_sesion}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-slate-800">{formatShortDate(sesion.fecha_sesion)}</h4>
                                </div>
                                {nlp && (
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-slate-100 bg-slate-50 text-slate-500">
                                    <HeartPulse className={`w-3 h-3 ${nlp.estrellas >= 4 ? 'text-emerald-500' : nlp.estrellas <= 2 ? 'text-rose-500' : 'text-amber-500'}`} />
                                    IA: {nlp.estrellas >= 4 ? 'Positivo' : nlp.estrellas <= 2 ? 'Riesgo' : 'Neutral'}
                                  </div>
                                )}
                              </div>
                              
                              {nota ? (
                                <div className="space-y-3">
                                  {nota.subjetivo && (
                                    <div>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subjetivo (Voz del paciente)</p>
                                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">{nota.subjetivo}</p>
                                    </div>
                                  )}
                                  {nota.plan && (
                                    <div>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Plan a seguir</p>
                                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">{nota.plan}</p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-slate-400 italic">No se redactó nota clínica para esta sesión.</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-slate-500 font-medium">El historial de sesiones está vacío.</p>
                    </div>
                  )}
                </div>
              )}
              
            </div>
          </>
        )}
      </div>

    </div>
  );
}