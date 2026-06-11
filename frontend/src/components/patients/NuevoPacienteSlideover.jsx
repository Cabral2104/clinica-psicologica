// Archivo: src/components/patients/NuevoPacienteSlideover.jsx
import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Phone, FileText, Loader2, AlertCircle, Activity } from 'lucide-react';
import api from '../../services/api';

export default function NuevoPacienteSlideover({ isOpen, onClose, onSuccess, pacienteEditando = null }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [catalogos, setCatalogos] = useState({
    generos: [],
    estadosPaciente: []
  });
  
  const estadoInicial = {
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: '',
    telefono: '',
    email: '',
    genero_id: '',
    estado_paciente_id: '', 
    motivo_consulta: '',
    antecedentes_personales: '',
    antecedentes_familiares: '',
    medicacion_actual: ''
  };

  const [formData, setFormData] = useState(estadoInicial);

  useEffect(() => {
    if (isOpen) {
      const fetchCatalogos = async () => {
        try {
          const [generosResponse, estadosResponse] = await Promise.all([
            api.get('/catalogos/genero'),
            api.get('/catalogos/estado_paciente')
          ]);

          const generos = generosResponse.data?.data || [];
          const estados = estadosResponse.data?.data || [];
          setCatalogos({ generos, estadosPaciente: estados });

          if (pacienteEditando) {
            setFormData({
              nombre: pacienteEditando.nombre || '',
              apellido_paterno: pacienteEditando.apellido_paterno || '',
              apellido_materno: pacienteEditando.apellido_materno || '',
              fecha_nacimiento: pacienteEditando.fecha_nacimiento || '',
              telefono: pacienteEditando.telefono || '',
              email: pacienteEditando.email || '',
              // Extracción defensiva de IDs
              genero_id: pacienteEditando.genero_id || pacienteEditando.genero?.id || '',
              estado_paciente_id: pacienteEditando.estado_paciente_id || pacienteEditando.estado_paciente?.id || '',
              motivo_consulta: pacienteEditando.motivo_consulta || '',
              antecedentes_personales: pacienteEditando.antecedentes_personales || '',
              antecedentes_familiares: pacienteEditando.antecedentes_familiares || '',
              medicacion_actual: pacienteEditando.medicacion_actual || ''
            });
          } else {
            const estadoActivo = estados.find(e => e.valor === 'Activo');
            setFormData(prev => ({ 
              ...estadoInicial, 
              estado_paciente_id: estadoActivo ? estadoActivo.id : '' 
            }));
          }
        } catch (error) {
          console.error("Error cargando catálogos:", error);
        }
      };
      fetchCatalogos();
    } else {
      setErrors({});
      setFormData(estadoInicial);
    }
  }, [isOpen, pacienteEditando]); 

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
      if (pacienteEditando) {
        await api.put(`/pacientes/${pacienteEditando.id}`, formData);
      } else {
        await api.post('/pacientes', formData);
      }
      
      onSuccess(); 
      onClose(); 
      
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'Ocurrió un error en el servidor. Intenta nuevamente.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const tituloModo = pacienteEditando ? 'Editar Expediente' : 'Nuevo Paciente';
  const subtituloModo = pacienteEditando ? 'Actualización de datos clínicos' : 'Apertura de expediente clínico';

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose}></div>

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{tituloModo}</h2>
            <p className="text-sm font-medium text-slate-500">{subtituloModo}</p>
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

          <form id="paciente-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600" /> Identidad
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nombre(s) *</label>
                  <input required type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all" />
                  {errors.nombre && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.nombre[0]}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Ap. Paterno *</label>
                    <input required type="text" name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all" />
                    {errors.apellido_paterno && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.apellido_paterno[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Ap. Materno</label>
                    <input type="text" name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Fecha Nac. *</label>
                    <input required type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all text-slate-700" />
                    {errors.fecha_nacimiento && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.fecha_nacimiento[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Género *</label>
                    <select required name="genero_id" value={formData.genero_id} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all text-slate-700">
                      <option value="">Seleccione...</option>
                      {catalogos.generos.map((gen) => (
                        <option key={gen.id} value={gen.id}>{gen.valor}</option>
                      ))}
                    </select>
                    {errors.genero_id && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.genero_id[0]}</p>}
                  </div>
                </div>

                {pacienteEditando && (
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Estado del Paciente</label>
                     <select required name="estado_paciente_id" value={formData.estado_paciente_id} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all text-slate-700">
                       {catalogos.estadosPaciente.map((estado) => (
                         <option key={estado.id} value={estado.id}>{estado.valor}</option>
                       ))}
                     </select>
                  </div>
                )}
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-600" /> Contacto
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Teléfono</label>
                     <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all" />
                   </div>
                   <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Correo Electrónico</label>
                     <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all" />
                   </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" /> Clínico y Antecedentes
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Motivo de Consulta *</label>
                  <textarea required name="motivo_consulta" rows="2" value={formData.motivo_consulta} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all resize-none" placeholder="Motivo principal por el que acude a terapia..." />
                  {errors.motivo_consulta && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.motivo_consulta[0]}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1 text-slate-500">Antecedentes Personales (Opcional)</label>
                  <textarea name="antecedentes_personales" rows="2" value={formData.antecedentes_personales} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all resize-none" placeholder="Enfermedades crónicas, cirugías, diagnósticos previos..." />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1 text-slate-500">Antecedentes Familiares (Opcional)</label>
                  <textarea name="antecedentes_familiares" rows="2" value={formData.antecedentes_familiares} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all resize-none" placeholder="Historia clínica familiar relevante..." />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1 text-slate-500">Medicación Actual (Opcional)</label>
                  <textarea name="medicacion_actual" rows="2" value={formData.medicacion_actual} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all resize-none" placeholder="Fármacos psiquiátricos u otros medicamentos actuales..." />
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white">
          <button
            type="submit"
            form="paciente-form"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (pacienteEditando ? 'Actualizar Expediente' : 'Registrar Paciente')}
          </button>
        </div>

      </div>
    </>
  );
}