// Archivo: src/pages/agenda/Agenda.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
// NUEVO: Importamos Edit2
import { Calendar as CalendarIcon, X, Clock, User, Activity, Tag, FileText, Loader2, Edit2 } from 'lucide-react';
import api from '../../services/api';
import NuevaSesionSlideover from '../../components/patients/NuevaSesionSlideover';

export default function Agenda() {
  const navigate = useNavigate();
  const calendarRef = useRef(null); 
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isNuevaSesionOpen, setIsNuevaSesionOpen] = useState(false);
  const [initialSesionData, setInitialSesionData] = useState(null);
  
  // NUEVO: Estado para saber qué sesión vamos a editar
  const [sesionAEditar, setSesionAEditar] = useState(null); 

  const getPrimerNombre = (nombreCompleto) => {
    if (!nombreCompleto) return '';
    return nombreCompleto.trim().split(' ')[0];
  };

  const fetchAgendaData = async (fetchInfo, successCallback, failureCallback) => {
    try {
      const response = await api.get('/sesiones/proximas', {
        params: { start: fetchInfo.startStr, end: fetchInfo.endStr }
      });
      
      const sesiones = response.data.data || [];

      const calendarEvents = sesiones.map(sesion => {
        const fechaLimpia = sesion.fecha_sesion ? sesion.fecha_sesion.split('T')[0] : '';
        const startStr = sesion.hora_inicio ? `${fechaLimpia}T${sesion.hora_inicio}` : fechaLimpia;
        const endStr = sesion.hora_fin ? `${fechaLimpia}T${sesion.hora_fin}` : null;
        const nombreCorto = getPrimerNombre(sesion.paciente?.nombre);
        const apellidoPaterno = sesion.paciente?.apellido_paterno || '';

        return {
          id: sesion.id,
          title: `${nombreCorto} ${apellidoPaterno}`.trim(),
          start: startStr,
          end: endStr,
          backgroundColor: '#0d9488', borderColor: '#0f766e', textColor: '#ffffff',
          extendedProps: {
            estado: sesion.estado_sesion?.valor || 'Programada',
            tipo: sesion.tipo_sesion?.valor || 'Terapia Individual',
            paciente_id: sesion.paciente_id,
            nombre_completo: `${sesion.paciente?.nombre} ${sesion.paciente?.apellido_paterno} ${sesion.paciente?.apellido_materno || ''}`,
            raw_session: sesion // NUEVO: Guardamos el objeto completo para poder editarlo
          }
        };
      });

      successCallback(calendarEvents);
    } catch (error) {
      console.error("Error al cargar la agenda de este rango:", error);
      failureCallback(error);
    }
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent({
      id: clickInfo.event.id,
      title: clickInfo.event.extendedProps.nombre_completo,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
      estado: clickInfo.event.extendedProps.estado,
      tipo: clickInfo.event.extendedProps.tipo,
      paciente_id: clickInfo.event.extendedProps.paciente_id,
      raw_session: clickInfo.event.extendedProps.raw_session // NUEVO
    });
  };

  const handleDateSelect = (selectInfo) => {
    const start = selectInfo.start;
    let end = selectInfo.end;
    if (((end.getTime() - start.getTime()) / 60000) <= 30) {
      end = new Date(start.getTime() + 50 * 60000); 
    }
    const pad = (n) => n < 10 ? '0' + n : n;
    
    setInitialSesionData({
      fecha_sesion: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
      hora_inicio: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
      hora_fin: `${pad(end.getHours())}:${pad(end.getMinutes())}`
    });
    setSesionAEditar(null); // Nos aseguramos de que es una cita nueva
    setIsNuevaSesionOpen(true);
    selectInfo.view.calendar.unselect();
  };

  const closeModal = () => setSelectedEvent(null);

  const formatModalDate = (d) => d ? d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
  const formatModalTime = (d) => d ? d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';

  const renderEventContent = (eventInfo) => (
    <div className="flex flex-col w-full h-full overflow-hidden p-1">
      <div className="text-[10px] font-medium opacity-90 leading-none mb-0.5">{eventInfo.timeText}</div>
      <div className="text-xs font-bold leading-tight truncate">{eventInfo.event.title}</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-teal-50 rounded-2xl text-teal-600"><CalendarIcon className="w-8 h-8" /></div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Agenda Clínica</h2>
            <p className="text-slate-500 font-medium mt-1">Gestiona tu tiempo y consultas programadas</p>
          </div>
        </div>
        <button 
          onClick={() => { setInitialSesionData(null); setSesionAEditar(null); setIsNuevaSesionOpen(true); }}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
        >
          + Nueva Cita
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] calendar-container relative z-0">
        <FullCalendar
          ref={calendarRef} 
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek" locales={[esLocale]} locale="es"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' }}
          events={fetchAgendaData} 
          eventClick={handleEventClick} selectable={true} selectMirror={true} select={handleDateSelect}
          slotMinTime="07:00:00" slotMaxTime="21:00:00" allDaySlot={false} height="auto" expandRows={true} stickyHeaderDates={true}
          eventContent={renderEventContent}
          eventClassNames="rounded-lg shadow-sm border cursor-pointer hover:opacity-95 transition-opacity overflow-hidden"
        />
      </div>

      {selectedEvent && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity" onClick={closeModal}></div>
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm pointer-events-auto animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
              
              <div className="bg-teal-600 p-5 flex items-center justify-between">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-teal-100" /> Detalle de Sesión
                </h3>
                {/* NUEVO: Contenedor con botón de Editar y botón de Cerrar */}
                <div className="flex items-center gap-1">
                  <button 
                    title="Editar Cita"
                    onClick={() => {
                      setSesionAEditar(selectedEvent.raw_session); // Pasamos los datos
                      setIsNuevaSesionOpen(true); // Abrimos el modal
                      closeModal(); // Cerramos la tarjeta
                    }} 
                    className="p-1.5 text-teal-100 hover:bg-teal-500 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={closeModal} className="p-1.5 text-teal-100 hover:bg-teal-500 rounded-xl transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0"><User className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Paciente</p>
                    <p className="text-slate-800 font-bold text-lg leading-tight">{selectedEvent.title}</p>
                  </div>
                </div>
                <hr className="border-slate-100" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> Fecha</p>
                    <p className="text-slate-700 font-medium text-sm capitalize">{formatModalDate(selectedEvent.start)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Horario</p>
                    <p className="text-slate-700 font-medium text-sm">
                      {formatModalTime(selectedEvent.start)} {selectedEvent.end && ` - ${formatModalTime(selectedEvent.end)}`}
                    </p>
                  </div>
                </div>
                <hr className="border-slate-100" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Tipo</p>
                    <span className="inline-flex bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-lg">{selectedEvent.tipo}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Estado</p>
                    <span className="inline-flex bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg">{selectedEvent.estado}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button onClick={closeModal} className="flex-1 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl shadow-sm transition-all">Cerrar</button>
                <button 
                  onClick={() => { closeModal(); navigate('/pacientes', { state: { openPatientId: selectedEvent.paciente_id } }); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition-all"
                ><FileText className="w-4 h-4" /> Expediente</button>
              </div>

            </div>
          </div>
        </>
      )}

      {/* Le pasamos la prop sesionEditando a nuestro formulario */}
      <NuevaSesionSlideover 
        isOpen={isNuevaSesionOpen} 
        onClose={() => {
          setIsNuevaSesionOpen(false);
          setSesionAEditar(null); // Limpiamos al cerrar
        }}
        onSuccess={() => calendarRef.current.getApi().refetchEvents()} 
        initialData={initialSesionData}
        sesionEditando={sesionAEditar}
      />

      <style jsx="true">{`
        .calendar-container .fc-theme-standard td, .calendar-container .fc-theme-standard th, .calendar-container .fc-theme-standard .fc-scrollgrid { border-color: #e2e8f0 !important; }
        .calendar-container .fc-timegrid-slot-minor { border-top: 1px dashed #cbd5e1 !important; }
        .calendar-container .fc-event-main { padding: 0 !important; }
        .calendar-container .fc-col-header-cell { background-color: #f8fafc; padding: 12px 0; color: #334155; font-weight: 700; }
        .calendar-container .fc-button-primary { background-color: #ffffff !important; color: #475569 !important; border-color: #e2e8f0 !important; text-transform: capitalize; font-weight: 600; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
        .calendar-container .fc-button-primary:hover { background-color: #f8fafc !important; }
        .calendar-container .fc-button-active { background-color: #f1f5f9 !important; color: #0f172a !important; }
        .calendar-container .fc-toolbar-title { font-weight: 800; color: #1e293b; text-transform: capitalize; }
        .calendar-container .fc-timegrid-slot { cursor: pointer; }
        .calendar-container .fc-highlight { background: rgba(13, 148, 136, 0.1); }
      `}</style>
    </div>
  );
}