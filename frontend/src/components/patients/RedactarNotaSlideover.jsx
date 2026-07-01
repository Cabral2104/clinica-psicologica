import React, { useState, useEffect } from 'react';
import { X, FileText, Loader2, AlertCircle, BrainCircuit, AlignLeft, Target, Activity, ListChecks } from 'lucide-react';
import api from '../../services/api';
import Cie10Autocomplete from '../shared/Cie10Autocomplete'; // Asegúrate de tener este componente

export default function RedactarNotaSlideover({ isOpen, onClose, onSuccess, sesionId, notaExistente }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState(null);
  
  const estadoInicial = {
    contenido: '', subjetivo: '', objetivo: '', analisis: '',
    plan: '', tecnicas_utilizadas: '', tareas_asignadas: '', observaciones: ''
  };

  const [formData, setFormData] = useState(estadoInicial);

  useEffect(() => {
    if (isOpen) {
      if (notaExistente) {
        setFormData({
          contenido: notaExistente.contenido || '',
          subjetivo: notaExistente.subjetivo || '',
          objetivo: notaExistente.objetivo || '',
          analisis: notaExistente.analisis || '',
          plan: notaExistente.plan || '',
          tecnicas_utilizadas: notaExistente.tecnicas_utilizadas || '',
          tareas_asignadas: notaExistente.tareas_asignadas || '',
          observaciones: notaExistente.observaciones_privadas || ''
        });
      } else {
        setFormData(estadoInicial);
      }
      setErrors({});
      setDiagnosticoSeleccionado(null);
    }
  }, [isOpen, notaExistente]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const payload = { 
        ...formData, 
        diagnostico_seleccionado: diagnosticoSeleccionado 
      };
      await api.post(`/sesiones/${sesionId}/nota`, payload);
      onSuccess(); 
      onClose(); 
    } catch (error) {
      if (error.response?.status === 422) setErrors(error.response.data.errors);
      else setErrors({ general: 'Ocurrió un error al guardar la nota.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !sesionId) return null;

  return (
    <>
      {/* Fondo oscuro para cerrar al hacer clic */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose}></div>

      {/* Panel lateral */}
      <div 
        className="fixed inset-y-0 right-0 z-50 w-full max-w-3xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" /> Expediente Clínico
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Metodología SOAP y análisis IA.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <form id="nota-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Resumen IA */}
            <div className="bg-teal-50/50 p-6 rounded-2xl border border-teal-100">
              <label className="block text-sm font-bold text-teal-800 mb-2 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" /> Resumen de la Sesión (Análisis IA) *
              </label>
              <textarea 
                required 
                name="contenido" 
                value={formData.contenido} 
                onChange={handleChange} 
                className="w-full min-h-[120px] p-4 bg-white border border-teal-200 rounded-xl text-sm focus:border-teal-500 outline-none transition-all resize-none text-slate-700" 
                placeholder="Narrativa general de la consulta..." 
              />
            </div>

            {/* SOAP */}
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Estructura Clínica (SOAP)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><AlignLeft className="w-4 h-4 text-slate-400" /> (S) Subjetivo</label>
                  <textarea name="subjetivo" value={formData.subjetivo} onChange={handleChange} className="w-full min-h-[100px] p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all resize-none text-slate-700" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><Target className="w-4 h-4 text-slate-400" /> (O) Objetivo</label>
                  <textarea name="objetivo" value={formData.objetivo} onChange={handleChange} className="w-full min-h-[100px] p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all resize-none text-slate-700" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><Activity className="w-4 h-4 text-slate-400" /> (A) Análisis</label>
                  <textarea name="analisis" value={formData.analisis} onChange={handleChange} className="w-full min-h-[100px] p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all resize-none text-slate-700" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><ListChecks className="w-4 h-4 text-slate-400" /> (P) Plan</label>
                  <textarea name="plan" value={formData.plan} onChange={handleChange} className="w-full min-h-[100px] p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all resize-none text-slate-700" />
                </div>
              </div>
            </div>

            {/* SECCIÓN DIAGNÓSTICO INTEGRADA */}
            <div className="pt-6 border-t border-slate-100">
              <Cie10Autocomplete onSelectAlternative={(item) => setDiagnosticoSeleccionado(item)} />
            </div>

            {/* INFO ADICIONAL */}
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Información Adicional</h3>
              <div className="space-y-4">
                <input type="text" name="tecnicas_utilizadas" placeholder="Técnicas utilizadas" value={formData.tecnicas_utilizadas} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <textarea name="tareas_asignadas" rows="2" placeholder="Tareas asignadas" value={formData.tareas_asignadas} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none resize-none" />
                  <textarea name="observaciones" rows="2" placeholder="Observaciones" value={formData.observaciones} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none resize-none" />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <div className="text-sm font-bold text-slate-400 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" /> Análisis automático activo
          </div>
          <button
            type="submit"
            form="nota-form"
            disabled={isLoading}
            className="flex items-center gap-2 py-3 px-8 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (notaExistente ? 'Actualizar' : 'Guardar y Analizar')}
          </button>
        </div>
      </div>
    </>
  );
}