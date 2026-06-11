// Archivo: src/pages/patients/Pacientes.jsx
import React, { useState, useEffect } from 'react';
// IMPORTANTE: Agregamos el icono 'Edit' de lucide-react
import { Users, Search, Calendar, Activity, ChevronDown, ChevronUp, Loader2, FileText, Clock, Edit } from 'lucide-react';
import api from '../../services/api';
import NuevaSesionSlideover from '../../components/patients/NuevaSesionSlideover';
import RedactarNotaSlideover from '../../components/patients/RedactarNotaSlideover'; 
// IMPORTAMOS el componente de pacientes para reutilizarlo en modo "Edición"
import NuevoPacienteSlideover from '../../components/patients/NuevoPacienteSlideover'; 

export default function Pacientes() {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [expandedPatientId, setExpandedPatientId] = useState(null);
  const [patientSessions, setPatientSessions] = useState({});
  const [loadingSessions, setLoadingSessions] = useState({});

  const [isNuevaSesionOpen, setIsNuevaSesionOpen] = useState(false);
  const [selectedPacienteIdForSesion, setSelectedPacienteIdForSesion] = useState(null);

  const [isNotaOpen, setIsNotaOpen] = useState(false);
  const [selectedSesionId, setSelectedSesionId] = useState(null);
  const [selectedNota, setSelectedNota] = useState(null);

  // NUEVOS ESTADOS: Para controlar la edición del paciente
  const [isEditPacienteOpen, setIsEditPacienteOpen] = useState(false);
  const [pacienteToEdit, setPacienteToEdit] = useState(null);

  const extractArray = (res) => {
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (Array.isArray(res.data)) return res.data;
    return [];
  };

  // Extraemos la función de fetch y le agregamos un parámetro 'showLoader'
  // Esto nos permite actualizar los datos en segundo plano sin mostrar la pantalla de carga
  const fetchPatients = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      const response = await api.get('/pacientes');
      setPatients(extractArray(response));
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  // Se ejecuta solo al cargar la página por primera vez
  useEffect(() => {
    fetchPatients(true);
  }, []);

  const fetchSesionesPaciente = async (patientId) => {
    try {
      setLoadingSessions(prev => ({ ...prev, [patientId]: true }));
      const response = await api.get(`/pacientes/${patientId}/sesiones`);
      setPatientSessions(prev => ({ 
        ...prev, 
        [patientId]: extractArray(response)
      }));
    } catch (error) {
      console.error(`Error al cargar sesiones del paciente ${patientId}:`, error);
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
    if (!patientSessions[patientId]) {
      fetchSesionesPaciente(patientId);
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

  // Función que abre el formulario pasándole los datos
  const handleOpenEditPaciente = (paciente) => {
    setPacienteToEdit(paciente);
    setIsEditPacienteOpen(true);
  };

  // Al guardar la edición exitosamente, refrescamos la lista en silencio
  const handlePacienteEditSuccess = () => {
    fetchPatients(false); 
  };

  const handleSesionSuccess = () => {
    if (selectedPacienteIdForSesion) {
      fetchSesionesPaciente(selectedPacienteIdForSesion);
    }
  };

  const getBadgeInfo = (nota) => {
    if (!nota) return { text: 'Sin Nota', score: null, colorCls: 'bg-slate-100 text-slate-500 border-slate-200' };
    
    const analisis = nota.analisis_sentimiento || nota.analisisSentimiento;
    
    if (!analisis) return { text: 'Sin Análisis', score: null, colorCls: 'bg-slate-100 text-slate-400 border-slate-200' };
    
    const stars = analisis.estrellas;
    const formattedScore = analisis.score ? `${(analisis.score * 100).toFixed(1)}%` : null;

    if (stars >= 4) return { text: 'Positiva', score: formattedScore, colorCls: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
    if (stars <= 2) return { text: 'Negativa', score: formattedScore, colorCls: 'bg-rose-50 text-rose-600 border-rose-100' };
    return { text: 'Neutral', score: formattedScore, colorCls: 'bg-amber-50 text-amber-600 border-amber-100' };
  };

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
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar paciente..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all text-slate-700" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {patients.length === 0 ? (
          <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <p className="text-slate-500 font-medium">No hay pacientes registrados.</p>
          </div>
        ) : (
          patients.map((paciente) => {
            const isExpanded = expandedPatientId === paciente.id;
            const isLoadingThisSession = loadingSessions[paciente.id];
            const sesiones = patientSessions[paciente.id] || [];

            return (
              <div key={paciente.id} className={`bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-teal-200 shadow-md ring-4 ring-teal-50' : 'border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-slate-200'}`}>
                
                <div onClick={() => togglePatient(paciente.id)} className="p-6 flex flex-col sm:flex-row items-center gap-6 cursor-pointer select-none group">
                  <div className="flex items-center gap-5 flex-1 w-full">
                    <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center font-bold text-teal-700 text-2xl border border-teal-100 shadow-sm shrink-0">
                      {paciente.nombre?.substring(0,2).toUpperCase() || 'P'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-xl group-hover:text-teal-600 transition-colors">
                        {paciente.nombre} {paciente.apellido_paterno} {paciente.apellido_materno}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm font-medium text-slate-500">{paciente.email || 'Sin correo'}</p>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        <p className="text-sm font-medium text-slate-500">{paciente.telefono || 'Sin teléfono'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* BOTON DE EDICIÓN AÑADIDO AQUÍ */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Evita que se despliegue el acordeón al hacer clic en editar
                        handleOpenEditPaciente(paciente);
                      }}
                      className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
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
                        <FileText className="w-5 h-5 text-teal-500" />
                        Historial de Sesiones
                      </h4>
                      <button onClick={() => handleOpenNuevaSesion(paciente.id)} className="text-sm font-bold text-white hover:bg-teal-700 bg-teal-600 px-4 py-2 rounded-xl transition-colors shadow-sm">
                        + Agendar Sesión
                      </button>
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
                          const badge = getBadgeInfo(sesion.nota);

                          return (
                            <div key={sesion.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between h-full">
                               <div>
                                 <div className="flex justify-between items-start mb-4">
                                   <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                     <Calendar className="w-4 h-4 text-slate-400" />
                                     {sesion.fecha_sesion || sesion.created_at?.split('T')[0]}
                                   </div>
                                   <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                     Sesión #{sesion.numero_sesion}
                                   </span>
                                 </div>
                                 <div className="mb-4">
                                   <p className="text-sm font-bold text-slate-800">
                                     {sesion.tipo_sesion?.valor || 'Sesión General'}
                                   </p>
                                   <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1">
                                     <Clock className="w-3 h-3"/> 
                                     {sesion.hora_inicio ? `${sesion.hora_inicio} - ${sesion.hora_fin || 'N/A'}` : 'Horario por definir'}
                                   </p>
                                 </div>
                                 {sesion.observaciones_generales && (
                                   <div className="mb-4 bg-amber-50/50 border border-amber-100 p-3 rounded-xl">
                                     <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Notas previas a la cita</p>
                                     <p className="text-xs font-medium text-slate-600 line-clamp-3">
                                       {sesion.observaciones_generales}
                                     </p>
                                   </div>
                                 )}
                               </div>

                               <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                                  {sesion.nota ? (
                                      <div className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border ${badge.colorCls}`}>
                                        <Activity className="w-3.5 h-3.5" />
                                        <span>{badge.text}</span>
                                        {badge.score && (
                                          <span className="border-l border-current pl-1.5 ml-0.5 opacity-80">
                                            {badge.score}
                                          </span>
                                        )}
                                      </div>
                                  ) : (
                                    <div className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                                      Pendiente de Nota
                                    </div>
                                  )}
                                  
                                  <button 
                                    onClick={() => handleOpenNota(sesion.id, paciente.id, sesion.nota)}
                                    className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors"
                                  >
                                    {sesion.nota ? 'Ver Nota' : 'Redactar Nota'}
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

      {/* Componentes Deslizables (Slideovers) */}
      <NuevaSesionSlideover 
        isOpen={isNuevaSesionOpen} 
        onClose={() => setIsNuevaSesionOpen(false)}
        onSuccess={handleSesionSuccess}
        pacienteId={selectedPacienteIdForSesion}
      />

      <RedactarNotaSlideover 
        isOpen={isNotaOpen} 
        onClose={() => setIsNotaOpen(false)}
        onSuccess={handleSesionSuccess} 
        sesionId={selectedSesionId}
        notaExistente={selectedNota} 
      />

      {/* NUEVO SLIDEOVER PARA EDICIÓN DE PACIENTES */}
      <NuevoPacienteSlideover
        isOpen={isEditPacienteOpen}
        onClose={() => {
          setIsEditPacienteOpen(false);
          setPacienteToEdit(null); // Limpiamos el estado al cerrar
        }}
        onSuccess={handlePacienteEditSuccess}
        pacienteEditando={pacienteToEdit}
      />

    </div>
  );
}