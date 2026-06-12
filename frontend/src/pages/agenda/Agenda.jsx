// Archivo: src/pages/agenda/Agenda.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Importamos para poder navegar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Calendar as CalendarIcon, Loader2, X, Clock, User, Activity, Tag, FileText } from 'lucide-react';
import api from '../../services/api';

export default function Agenda() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const navigate = useNavigate(); // <-- Inicializamos el hook de navegación

  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/sesiones/proximas');
        const sesiones = response.data.data || [];

        const calendarEvents = sesiones.map(sesion => {
          const fechaLimpia = sesion.fecha_sesion ? sesion.fecha_sesion.split('T')[0] : '';
          const startStr = sesion.hora_inicio ? `${fechaLimpia}T${sesion.hora_inicio}` : fechaLimpia;
          const endStr = sesion.hora_fin ? `${fechaLimpia}T${sesion.hora_fin}` : null;

          return {
            id: sesion.id,
            title: `${sesion.paciente?.nombre} ${sesion.paciente?.apellido_paterno}`,
            start: startStr,
            end: endStr,
            backgroundColor: '#0d9488', 
            borderColor: '#0f766e',     
            textColor: '#ffffff',
            extendedProps: {
              estado: sesion.estado_sesion?.valor || 'Programada',
              tipo: sesion.tipo_sesion?.valor || 'Terapia Individual',
              paciente_id: sesion.paciente_id // Guardamos el ID por si lo necesitamos en la URL más adelante
            }
          };
        });

        setEvents(calendarEvents);
      } catch (error) {
        console.error("Error al cargar la agenda:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgenda();
  }, []);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
      estado: clickInfo.event.extendedProps.estado,
      tipo: clickInfo.event.extendedProps.tipo,
      paciente_id: clickInfo.event.extendedProps.paciente_id
    });
  };

  const closeModal = () => setSelectedEvent(null);

  const formatModalDate = (dateObj) => {
    if (!dateObj) return '';
    return dateObj.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const formatModalTime = (dateObj) => {
    if (!dateObj) return '';
    return dateObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
        <p className="text-slate-500 font-medium">Cargando agenda clínica...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-teal-50 rounded-2xl text-teal-600">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Agenda Clínica</h2>
            <p className="text-slate-500 font-medium mt-1">Gestiona tu tiempo y consultas programadas</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] calendar-container relative z-0">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek" 
          locales={[esLocale]}
          locale="es"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día'
          }}
          events={events}
          eventClick={handleEventClick}
          slotMinTime="07:00:00" 
          slotMaxTime="21:00:00" 
          allDaySlot={false}     
          height="auto"          
          expandRows={true}
          stickyHeaderDates={true}
          eventClassNames="rounded-md shadow-sm border text-xs font-bold p-1 cursor-pointer hover:opacity-90 transition-opacity"
        />
      </div>

      {selectedEvent && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity" 
            onClick={closeModal}
          ></div>
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm pointer-events-auto animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
              
              <div className="bg-teal-600 p-5 flex items-center justify-between">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-teal-100" />
                  Detalle de Sesión
                </h3>
                <button 
                  onClick={closeModal} 
                  className="p-1.5 text-teal-100 hover:bg-teal-500 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
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
                      {formatModalTime(selectedEvent.start)}
                      {selectedEvent.end && ` - ${formatModalTime(selectedEvent.end)}`}
                    </p>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Tipo</p>
                    <span className="inline-flex bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                      {selectedEvent.tipo}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Estado</p>
                    <span className="inline-flex bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                      {selectedEvent.estado}
                    </span>
                  </div>
                </div>

              </div>

              {/* Nuevos Botones de acción (Flexbox) */}
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button 
                  onClick={closeModal}
                  className="flex-1 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all shadow-sm"
                >
                  Cerrar
                </button>
                <button 
                  onClick={() => {
                    closeModal();
                    navigate('/pacientes', { state: { openPatientId: selectedEvent.paciente_id } }); // Redirige a tu directorio actual
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  Expediente
                </button>
              </div>

            </div>
          </div>
        </>
      )}

      <style jsx="true">{`
        .calendar-container .fc-theme-standard td, 
        .calendar-container .fc-theme-standard th, 
        .calendar-container .fc-theme-standard .fc-scrollgrid {
          border-color: #f1f5f9; 
        }
        .calendar-container .fc-col-header-cell {
          background-color: #f8fafc; 
          padding: 12px 0;
          color: #334155; 
          font-weight: 700;
        }
        .calendar-container .fc-button-primary {
          background-color: #ffffff !important;
          color: #475569 !important;
          border-color: #e2e8f0 !important;
          text-transform: capitalize;
          font-weight: 600;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }
        .calendar-container .fc-button-primary:hover {
          background-color: #f8fafc !important;
        }
        .calendar-container .fc-button-active {
          background-color: #f1f5f9 !important;
          color: #0f172a !important;
        }
        .calendar-container .fc-toolbar-title {
          font-weight: 800;
          color: #1e293b;
          text-transform: capitalize;
        }
      `}</style>
    </div>
  );
}