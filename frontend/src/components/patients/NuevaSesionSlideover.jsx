// Archivo: src/components/patients/NuevaSesionSlideover.jsx
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, DollarSign, FileText, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function NuevaSesionSlideover({ isOpen, onClose, onSuccess, pacienteId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [catalogos, setCatalogos] = useState({
    tiposSesion: [],
    estadosSesion: []
  });
  
  const [formData, setFormData] = useState({
    fecha_sesion: new Date().toISOString().split('T')[0], // Hoy por defecto
    hora_inicio: '',
    hora_fin: '',
    tipo_sesion_id: '',
    estado_sesion_id: '', 
    costo: '',
    observaciones_generales: ''
  });

  // Cargar catálogos al abrir el panel
  useEffect(() => {
    if (isOpen) {
      const fetchCatalogos = async () => {
        try {
          const [tiposResponse, estadosResponse] = await Promise.all([
            api.get('/catalogos/tipo_sesion'),
            api.get('/catalogos/estado_sesion')
          ]);

          const tipos = tiposResponse.data?.data || [];
          const estados = estadosResponse.data?.data || [];

          setCatalogos({ tiposSesion: tipos, estadosSesion: estados });

          // Seleccionar "Pendiente" o "Programada" por defecto si existe
          const estadoPendiente = estados.find(e => e.valor === 'Pendiente' || e.valor === 'Programada');
          
          setFormData(prev => ({ 
            ...prev, 
            estado_sesion_id: estadoPendiente?.id || '',
            fecha_sesion: new Date().toISOString().split('T')[0] // Reiniciar fecha a hoy
          }));

        } catch (error) {
          console.error("Error cargando catálogos de sesiones:", error);
        }
      };
      fetchCatalogos();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Enviar POST a la ruta anidada exigida por el backend
      await api.post(`/pacientes/${pacienteId}/sesiones`, formData);
      
      onSuccess(); // Disparar la recarga de sesiones
      onClose(); // Cerrar panel
      
      // Limpiar formulario
      setFormData({
        fecha_sesion: new Date().toISOString().split('T')[0],
        hora_inicio: '', hora_fin: '', tipo_sesion_id: '', 
        estado_sesion_id: catalogos.estadosSesion[0]?.id || '', 
        costo: '', observaciones_generales: ''
      });
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'Ocurrió un error al agendar la sesión. Intenta nuevamente.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !pacienteId) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      ></div>

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Agendar Sesión</h2>
            <p className="text-sm font-medium text-slate-500">Programar nueva cita para el paciente</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          {errors.general && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-rose-600">{errors.general}</p>
            </div>
          )}

          <form id="sesion-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Sección: Programación */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" /> Programación
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Fecha de la sesión *</label>
                  <input required type="date" name="fecha_sesion" value={formData.fecha_sesion} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all text-slate-700" />
                  {errors.fecha_sesion && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.fecha_sesion[0]}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Inicio</label>
                    <input type="time" name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all" />
                    {errors.hora_inicio && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.hora_inicio[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Fin</label>
                    <input type="time" name="hora_fin" value={formData.hora_fin} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all" />
                    {errors.hora_fin && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.hora_fin[0]}</p>}
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Sección: Detalles Administrativos */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" /> Detalles
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Tipo de Sesión *</label>
                    <select required name="tipo_sesion_id" value={formData.tipo_sesion_id} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all text-slate-700">
                      <option value="">Seleccione...</option>
                      {catalogos.tiposSesion.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>{tipo.valor}</option>
                      ))}
                    </select>
                    {errors.tipo_sesion_id && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.tipo_sesion_id[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Estado *</label>
                    <select required name="estado_sesion_id" value={formData.estado_sesion_id} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all text-slate-700">
                      <option value="">Seleccione...</option>
                      {catalogos.estadosSesion.map((estado) => (
                        <option key={estado.id} value={estado.id}>{estado.valor}</option>
                      ))}
                    </select>
                    {errors.estado_sesion_id && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.estado_sesion_id[0]}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5"/> Costo (Opcional)</label>
                  <input type="number" step="0.01" name="costo" value={formData.costo} onChange={handleChange} placeholder="Ej. 500.00" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all" />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" /> Observaciones Previas
              </h3>
              <div>
                <textarea name="observaciones_generales" rows="3" value={formData.observaciones_generales} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all resize-none" placeholder="Motivo de la cita, acuerdos previos, etc." />
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white">
          <button
            type="submit"
            form="sesion-form"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Sesión'}
          </button>
        </div>

      </div>
    </>
  );
}