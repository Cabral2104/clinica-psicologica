// Archivo: src/pages/patients/Pacientes.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; 
import { Users, Search, Calendar, Activity, ChevronDown, ChevronUp, Loader2, FileText, Clock, Edit, Power, Filter } from 'lucide-react';
import api from '../../services/api';
import NuevaSesionSlideover from '../../components/patients/NuevaSesionSlideover';
import RedactarNotaSlideover from '../../components/patients/RedactarNotaSlideover'; 
import NuevoPacienteSlideover from '../../components/patients/NuevoPacienteSlideover'; 

export default function Pacientes() {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const [expandedPatientId, setExpandedPatientId] = useState(null);
  const [patientSessions, setPatientSessions] = useState({});
  const [loadingSessions, setLoadingSessions] = useState({});

  const [isNuevaSesionOpen, setIsNuevaSesionOpen] = useState(false);
  const [selectedPacienteIdForSesion, setSelectedPacienteIdForSesion] = useState(null);

  const [isNotaOpen, setIsNotaOpen] = useState(false);
  const [selectedSesionId, setSelectedSesionId] = useState(null);
  const [selectedNota, setSelectedNota] = useState(null);

  const [isEditPacienteOpen, setIsEditPacienteOpen] = useState(false);
  const [pacienteToEdit, setPacienteToEdit] = useState(null);

  const location = useLocation();

  const extractArray = (res) => {
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (Array.isArray(res.data)) return res.data;
    return [];
  };

  const fetchPatients = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      const response = await api.get('/pacientes');
      const data = extractArray(response);
      setPatients(data);
      return data; 
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
      return [];
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      const fetchedPatients = await fetchPatients(true);
      if (location.state && location.state.openPatientId) {
        const targetId = location.state.openPatientId;
        const pacienteExiste = fetchedPatients.some(p => p.id === targetId);
        if (pacienteExiste) {
          setExpandedPatientId(targetId);
          fetchSesionesPaciente(targetId);
          window.history.replaceState({}, document.title);
        }
      }
    };
    initializePage();
  }, [location]);

  const fetchSesionesPaciente = async (patientId) => {
    try {
      setLoadingSessions(prev => ({ ...prev, [patientId]: true }));
      const response = await api.get(`/pacientes/${patientId}/sesiones`);
      setPatientSessions(prev => ({ ...prev, [patientId]: extractArray(response) }));
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setPatientSessions(prev => ({ ...prev, [patientId]: [] }));
      } else {
        console.error(`Error al cargar sesiones del paciente ${patientId}:`, error);
        setPatientSessions(prev => ({ ...prev, [patientId]: [] }));
      }
    } finally {
      setLoadingSessions(prev => ({ ...prev, [patientId]: false }));
    }
  };

  const togglePatient = (patientId) => {
    if (expandedPatientId === patientId) {
      setExpandedPatientId(null);
      return;
    }
    setExpandedPatientId(patientId);
    if (!patientSessions[patientId]) fetchSesionesPaciente(patientId);
  };

  const handleToggleStatus = async (pacienteId) => {
    try {
      await api.patch(`/pacientes/${pacienteId}/toggle-status`);
      fetchPatients(false); 
    } catch (error) {
      console.error("Error al cambiar el estado del paciente", error);
    }
  };

  const handleOpenNuevaSesion = (pacienteId) => {
    setSelectedPacienteIdForSesion(pacienteId);
    setIsNuevaSesionOpen(true);
  };

  const handleOpenNota = (sesionId, pacienteId, nota = null) => {
    setSelectedSesionId(sesionId);
    setSelectedPacienteIdForSesion(pacienteId); 
    setSelectedNota(nota); 
    setIsNotaOpen(true);
  };

  const handleOpenEditPaciente = (paciente) => {
    setPacienteToEdit(paciente);
    setIsEditPacienteOpen(true);
  };

  const handlePacienteEditSuccess = () => fetchPatients(false);
  const handleSesionSuccess = () => {
    if (selectedPacienteIdForSesion) fetchSesionesPaciente(selectedPacienteIdForSesion);
  };

 const getBadgeInfo = (nota) => {
  // Si no hay nota, no hay análisis
  if (!nota) return { text: 'Sin Nota', score: null, colorCls: 'bg-slate-100 text-slate-500' };
  
  // Accedemos a la relación 'analisis_sentimiento' que definimos en el controlador
  const analisis = nota.analisis_sentimiento;
  
  if (!analisis) return { text: 'Sin Análisis', score: null, colorCls: 'bg-slate-100 text-slate-400' };
  
  const score = analisis.score ? (analisis.score * 100).toFixed(0) + '%' : '';
  
  // Lógica de colores según el sentimiento
  if (analisis.estrellas >= 4) return { text: 'POSITIVA', score, colorCls: 'bg-emerald-50 text-emerald-600' };
  if (analisis.estrellas <= 2) return { text: 'NEGATIVA', score, colorCls: 'bg-rose-50 text-rose-600' };
  return { text: 'NEUTRAL', score, colorCls: 'bg-amber-50 text-amber-600' };
};

  // NUEVO: Función para dar formato corto y amigable a la fecha
  const formatShortDate = (dateString) => {
    if (!dateString) return '';
    // Concatenamos 'T00:00:00' para evitar que el navegador reste un día por la zona horaria
    const date = new Date(dateString.split('T')[0] + 'T00:00:00');
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filteredPatients = patients.filter(paciente => {
    const matchesStatus = 
      filtroEstado === 'todos' ||
      (filtroEstado === 'activos' && (paciente.status === 1 || paciente.status === true)) ||
      (filtroEstado === 'inactivos' && (paciente.status === 0 || paciente.status === false));

    const nombreCompleto = `${paciente.nombre} ${paciente.apellido_paterno} ${paciente.apellido_materno || ''}`.toLowerCase();
    const email = (paciente.email || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    
    const matchesSearch = nombreCompleto.includes(query) || email.includes(query);

    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
        <p className="text-slate-500 font-medium">Cargando directorio de pacientes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-2xl text-blue-500">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Directorio Clínico</h2>
            <p className="text-slate-500 font-medium mt-1">Gestiona a tus pacientes y sus historiales</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-40">
            <Filter className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full pl-11 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 outline-none transition-all text-slate-700 appearance-none"
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar paciente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all text-slate-700" 
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredPatients.length === 0 ? (
          <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <p className="text-slate-500 font-medium">No se encontraron pacientes bajo este filtro o búsqueda.</p>
          </div>
        ) : (
          filteredPatients.map((paciente) => {
            const isExpanded = expandedPatientId === paciente.id;
            const isLoadingThisSession = loadingSessions[paciente.id];
            const sesiones = patientSessions[paciente.id] || [];
            const isActivo = paciente.status === 1 || paciente.status === true;

            return (
              <div key={paciente.id} className={`bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-teal-200 shadow-md ring-4 ring-teal-50' : 'border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-slate-200'} ${!isActivo ? 'opacity-75 bg-slate-50/50' : ''}`}>
                
                <div onClick={() => togglePatient(paciente.id)} className="p-6 flex flex-col sm:flex-row items-center gap-6 cursor-pointer select-none group">
                  <div className="flex items-center gap-5 flex-1 w-full">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl border shadow-sm shrink-0 ${isActivo ? 'bg-teal-50 text-teal-700 border-teal-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                      {paciente.nombre?.substring(0,2).toUpperCase() || 'P'}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className={`font-bold text-xl transition-colors ${isActivo ? 'text-slate-800 group-hover:text-teal-600' : 'text-slate-500'}`}>
                          {paciente.nombre} {paciente.apellido_paterno} {paciente.apellido_materno}
                        </h3>
                        {!isActivo && <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-bold uppercase rounded-md">Inactivo</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm font-medium text-slate-500">{paciente.email || 'Sin correo'}</p>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        <p className="text-sm font-medium text-slate-500">{paciente.telefono || 'Sin teléfono'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleToggleStatus(paciente.id); }}
                      className={`p-2 rounded-xl transition-colors ${isActivo ? 'text-rose-400 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                      title={isActivo ? "Desactivar Paciente" : "Reactivar Paciente"}
                    >
                      <Power className="w-5 h-5" />
                    </button>

                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenEditPaciente(paciente); }}
                      className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-700 rounded-xl transition-colors"
                      title="Editar Expediente"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    
                    <div className={`p-2 rounded-xl transition-colors ${isExpanded ? 'bg-teal-50 text-teal-600' : 'text-slate-400 group-hover:bg-slate-50'}`}>
                      {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-6 md:p-8 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-bold text-slate-700 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-teal-500" /> Historial de Sesiones
                      </h4>
                      {isActivo && (
                        <button onClick={() => handleOpenNuevaSesion(paciente.id)} className="text-sm font-bold text-white hover:bg-teal-700 bg-teal-600 px-4 py-2 rounded-xl transition-colors shadow-sm">
                          + Agendar Sesión
                        </button>
                      )}
                    </div>

                    {isLoadingThisSession ? (
                      <div className="flex items-center justify-center py-8">
                         <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                      </div>
                    ) : sesiones.length === 0 ? (
                      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm font-medium text-slate-500">
                        Este paciente aún no tiene sesiones programadas en su expediente.
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {sesiones.map((sesion) => {
                          // AQUÍ ASEGURAMOS QUE LEA LA NOTA COMO LA MANDA LARAVEL
                          const notaActual = sesion.nota;
                          const badge = getBadgeInfo(notaActual);
                          
                          return (
                            <div key={sesion.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between h-full">
                               <div>
                                 <div className="flex justify-between items-start mb-4">
                                   <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                     <Calendar className="w-4 h-4 text-slate-400" />
                                     {/* AQUÍ APLICAMOS LA FECHA FORMATEADA */}
                                     {formatShortDate(sesion.fecha_sesion || sesion.created_at)}
                                   </div>
                                   <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                     Sesión #{sesion.numero_sesion}
                                   </span>
                                 </div>
                                 <div className="mb-4">
                                   <p className="text-sm font-bold text-slate-800">{sesion.tipo_sesion?.valor || 'Sesión General'}</p>
                                   <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1">
                                     <Clock className="w-3 h-3"/> {sesion.hora_inicio ? `${sesion.hora_inicio} - ${sesion.hora_fin || 'N/A'}` : 'Horario por definir'}
                                   </p>
                                 </div>
                                 {sesion.observaciones_generales && (
                                   <div className="mb-4 bg-amber-50/50 border border-amber-100 p-3 rounded-xl">
                                     <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Notas previas a la cita</p>
                                     <p className="text-xs font-medium text-slate-600 line-clamp-3">{sesion.observaciones_generales}</p>
                                   </div>
                                 )}
                               </div>

                               <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                                  {notaActual ? (
                                      <div className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border ${badge.colorCls}`}>
                                        <Activity className="w-3.5 h-3.5" />
                                        <span>{badge.text}</span>
                                        {badge.score && <span className="border-l border-current pl-1.5 ml-0.5 opacity-80">{badge.score}</span>}
                                      </div>
                                  ) : (
                                    <div className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">Pendiente de Nota</div>
                                  )}
                                  <button onClick={() => handleOpenNota(sesion.id, paciente.id, notaActual)} className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors">
                                    {notaActual ? 'Ver Nota' : 'Redactar Nota'}
                                  </button>
                               </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <NuevaSesionSlideover isOpen={isNuevaSesionOpen} onClose={() => setIsNuevaSesionOpen(false)} onSuccess={handleSesionSuccess} pacienteId={selectedPacienteIdForSesion} />
      <RedactarNotaSlideover isOpen={isNotaOpen} onClose={() => setIsNotaOpen(false)} onSuccess={handleSesionSuccess} sesionId={selectedSesionId} notaExistente={selectedNota} />
      <NuevoPacienteSlideover isOpen={isEditPacienteOpen} onClose={() => { setIsEditPacienteOpen(false); setPacienteToEdit(null); }} onSuccess={handlePacienteEditSuccess} pacienteEditando={pacienteToEdit} />

    </div>
  );
}