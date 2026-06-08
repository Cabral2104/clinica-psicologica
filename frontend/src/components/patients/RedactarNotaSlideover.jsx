import React, { useState, useEffect } from 'react';
import { X, FileText, Loader2, AlertCircle, BrainCircuit, AlignLeft, Target, Activity, ListChecks } from 'lucide-react';
import api from '../../services/api';

// Añadimos "notaExistente" a las props
export default function RedactarNotaSlideover({ isOpen, onClose, onSuccess, sesionId, notaExistente }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const estadoInicial = {
    contenido: '', subjetivo: '', objetivo: '', analisis: '',
    plan: '', tecnicas_utilizadas: '', tareas_asignadas: '', observaciones: ''
  };

  const [formData, setFormData] = useState(estadoInicial);

  // Cuando el panel se abre, revisamos si hay una nota para llenarla
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
          observaciones: notaExistente.observaciones || ''
        });
      } else {
        setFormData(estadoInicial);
      }
      setErrors({});
    }
  }, [isOpen, notaExistente]);

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
      await api.post(`/sesiones/${sesionId}/nota`, formData);
      onSuccess(); 
      onClose(); 
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'Ocurrió un error al guardar la nota o al procesar la IA.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !sesionId) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose}></div>

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-3xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Expediente Clínico
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Metodología SOAP y análisis automático por Inteligencia Artificial.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {errors.general && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-rose-600">{errors.general}</p>
            </div>
          )}

          <form id="nota-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-teal-50/50 p-6 rounded-2xl border border-teal-100">
              <label className="block text-sm font-bold text-teal-800 mb-2 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" /> Resumen de la Sesión (Análisis NLP) *
              </label>
              <p className="text-xs text-teal-600 mb-3 font-medium">Este campo principal será evaluado por el motor de Inteligencia Artificial.</p>
              <textarea 
                required 
                name="contenido" 
                value={formData.contenido} 
                onChange={handleChange} 
                className="w-full min-h-[120px] p-4 bg-white border border-teal-200 rounded-xl text-sm focus:border-teal-500 outline-none transition-all resize-none text-slate-700" 
                placeholder="Narrativa general de la consulta..." 
              />
              {errors.contenido && <p className="text-xs text-rose-500 mt-2 font-medium">{errors.contenido[0]}</p>}
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Estructura Clínica (SOAP)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><AlignLeft className="w-4 h-4 text-slate-400" /> (S) Subjetivo</label>
                  <textarea name="subjetivo" value={formData.subjetivo} onChange={handleChange} className="w-full min-h-[100px] p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all resize-none text-slate-700" placeholder="Lo que refiere el paciente..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><Target className="w-4 h-4 text-slate-400" /> (O) Objetivo</label>
                  <textarea name="objetivo" value={formData.objetivo} onChange={handleChange} className="w-full min-h-[100px] p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all resize-none text-slate-700" placeholder="Observaciones clínicas..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><Activity className="w-4 h-4 text-slate-400" /> (A) Análisis</label>
                  <textarea name="analisis" value={formData.analisis} onChange={handleChange} className="w-full min-h-[100px] p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all resize-none text-slate-700" placeholder="Interpretación profesional..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><ListChecks className="w-4 h-4 text-slate-400" /> (P) Plan</label>
                  <textarea name="plan" value={formData.plan} onChange={handleChange} className="w-full min-h-[100px] p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all resize-none text-slate-700" placeholder="Pasos a seguir..." />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Información Adicional</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Técnicas Utilizadas</label>
                  <input type="text" name="tecnicas_utilizadas" value={formData.tecnicas_utilizadas} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tareas Asignadas</label>
                    <textarea name="tareas_asignadas" rows="2" value={formData.tareas_asignadas} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Observaciones</label>
                    <textarea name="observaciones" rows="2" value={formData.observaciones} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all resize-none" />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
             <BrainCircuit className="w-4 h-4" />
             El análisis NLP procesará el Resumen General.
          </div>
          <button
            type="submit"
            form="nota-form"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-3 px-8 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {/* Si ya hay nota, el botón cambia su texto inteligentemente */}
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (notaExistente ? 'Actualizar y Re-analizar' : 'Guardar y Analizar (IA)')}
          </button>
        </div>

      </div>
    </>
  );
}