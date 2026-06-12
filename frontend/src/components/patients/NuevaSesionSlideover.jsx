// Archivo: src/components/patients/NuevaSesionSlideover.jsx
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, DollarSign, FileText, Loader2, AlertCircle, User } from 'lucide-react';
import api from '../../services/api';

export default function NuevaSesionSlideover({ isOpen, onClose, onSuccess, pacienteId, initialData, sesionEditando }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [catalogos, setCatalogos] = useState({
    tiposSesion: [],
    estadosSesion: [],
    pacientes: [] 
  });
  
  const [formData, setFormData] = useState({
    fecha_sesion: new Date().toISOString().split('T')[0],
    hora_inicio: '',
    hora_fin: '',
    tipo_sesion_id: '',
    estado_sesion_id: '', 
    costo: '',
    observaciones_generales: '',
    selected_paciente_id: '' 
  });

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [tiposResponse, estadosResponse] = await Promise.all([
            api.get('/catalogos/tipo_sesion'),
            api.get('/catalogos/estado_sesion')
          ]);

          const tipos = tiposResponse.data?.data || [];
          const estados = estadosResponse.data?.data || [];
          let listaPacientes = [];
          
          if (!pacienteId && !sesionEditando) {
            const pacientesResponse = await api.get('/pacientes');
            listaPacientes = pacientesResponse.data?.data || pacientesResponse.data || [];
          }

          setCatalogos({ tiposSesion: tipos, estadosSesion: estados, pacientes: listaPacientes });

          if (sesionEditando) {
            setFormData({
              fecha_sesion: sesionEditando.fecha_sesion?.split('T')[0] || new Date().toISOString().split('T')[0],
              
              // FIX 1: Cortamos los segundos (Ej. "09:30:00" -> "09:30") para cumplir con la validación de Laravel
              hora_inicio: sesionEditando.hora_inicio ? sesionEditando.hora_inicio.substring(0, 5) : '',
              hora_fin: sesionEditando.hora_fin ? sesionEditando.hora_fin.substring(0, 5) : '',
              
              tipo_sesion_id: sesionEditando.tipo_sesion_id || '',
              estado_sesion_id: sesionEditando.estado_sesion_id || '',
              costo: sesionEditando.costo || '',
              observaciones_generales: sesionEditando.observaciones_generales || '',
              selected_paciente_id: sesionEditando.paciente_id || ''
            });
          } else {
            const estadoPendiente = estados.find(e => e.valor === 'Pendiente' || e.valor === 'Programada');
            setFormData({ 
              fecha_sesion: initialData?.fecha_sesion || new Date().toISOString().split('T')[0],
              hora_inicio: initialData?.hora_inicio || '',
              hora_fin: initialData?.hora_fin || '',
              tipo_sesion_id: '',
              estado_sesion_id: estadoPendiente?.id || '',
              costo: '',
              observaciones_generales: '',
              selected_paciente_id: pacienteId || '' 
            });
          }
        } catch (error) {
          console.error("Error cargando datos:", error);
        }
      };
      fetchData();
    } else {
      setErrors({});
    }
  }, [isOpen, pacienteId, initialData, sesionEditando]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const targetPacienteId = pacienteId || formData.selected_paciente_id;
    if (!targetPacienteId) {
      setErrors({ general: 'Debes seleccionar un paciente.' });
      setIsLoading(false);
      return;
    }

    try {
      // FIX 2 y 3: Construimos un payload sanitizado
      const payload = {
        ...formData,
        paciente_id: targetPacienteId, // Forzamos el ID en el body
        costo: formData.costo === '' ? null : formData.costo // Convertimos "" a null
      };

      if (sesionEditando) {
        await api.put(`/pacientes/${targetPacienteId}/sesiones/${sesionEditando.id}`, payload);
      } else {
        await api.post(`/pacientes/${targetPacienteId}/sesiones`, payload);
      }
      
      onSuccess(); 
      onClose(); 
      
    } catch (error) {
      if (error.response && error.response.status === 422) {
        // Imprimimos los errores exactos en consola para poder debuggear si hace falta
        console.warn("Errores de validación Laravel:", error.response.data.errors);
        
        const apiErrors = error.response.data.errors;
        setErrors(apiErrors);
        
        // Si el error corresponde a un campo oculto que no está en el formulario, lo mostramos arriba
        if (!apiErrors.fecha_sesion && !apiErrors.hora_inicio && !apiErrors.hora_fin && !apiErrors.tipo_sesion_id && !apiErrors.estado_sesion_id && !apiErrors.costo && !apiErrors.observaciones_generales) {
           setErrors(prev => ({...prev, general: 'Error de validación. Revisa la consola para más detalles.'}));
        }
      } else {
        setErrors({ general: 'Ocurrió un error al procesar la sesión. Intenta nuevamente.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose}></div>
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {sesionEditando ? 'Editar Sesión' : 'Agendar Sesión'}
            </h2>
            <p className="text-sm font-medium text-slate-500">
              {sesionEditando ? 'Modificar datos de la cita' : 'Programar nueva cita'}
            </p>
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
            
            {!pacienteId && !sesionEditando && (
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-600" /> Paciente
                </h3>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Selecciona el paciente *</label>
                  <select required name="selected_paciente_id" value={formData.selected_paciente_id} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all text-slate-700">
                    <option value="">Seleccione un paciente de la lista...</option>
                    {catalogos.pacientes.map((pac) => (
                      <option key={pac.id} value={pac.id}>{pac.nombre} {pac.apellido_paterno} {pac.apellido_materno}</option>
                    ))}
                  </select>
                </div>
                <hr className="border-slate-100 mt-6" />
              </div>
            )}

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
                  {errors.costo && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.costo[0]}</p>}
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
          <button type="submit" form="sesion-form" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </>
  );
}