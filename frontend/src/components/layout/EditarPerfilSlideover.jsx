// Archivo: src/components/layout/EditarPerfilSlideover.jsx
import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function EditarPerfilSlideover({ isOpen, onClose }) {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: ''
      });
      setErrors({});
      setSuccessMsg('');
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMsg('');

    try {
      const response = await api.put('/auth/perfil', formData);
      const updatedUser = response.data.user;

      // EL FIX MÁGICO: Sobrescribimos el LocalStorage directamente
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      
      setSuccessMsg('Perfil actualizado correctamente.');

      // Actualizamos el Navbar en tiempo real
      if (setUser) {
        setUser(updatedUser);
      } else {
        // Plan de contingencia: si el contexto no está listo, forzamos un refresh limpio
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return;
      }

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'Hubo un error al actualizar el perfil.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="fixed inset-y-0 right-0 z-[60] w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" /> Mi Perfil
            </h2>
            <p className="text-sm font-medium text-slate-500">Configuración de cuenta y credenciales</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
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
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-emerald-700">{successMsg}</p>
            </div>
          )}

          <form id="perfil-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400"/> Nombre Completo *
              </label>
              <input 
                required 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all" 
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400"/> Correo Electrónico *
              </label>
              <input 
                required 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all" 
              />
              {errors.email && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email[0]}</p>}
            </div>

            <hr className="border-slate-100 my-6" />
            
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" /> Cambiar Contraseña
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Deja estos campos en blanco si no deseas cambiar tu contraseña actual.
              </p>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nueva Contraseña</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-teal-500 outline-none transition-all" 
                  placeholder="Mínimo 8 caracteres" 
                />
                {errors.password && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password[0]}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirmar Nueva Contraseña</label>
                <input 
                  type="password" 
                  name="password_confirmation" 
                  value={formData.password_confirmation} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-teal-500 outline-none transition-all" 
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white shrink-0">
          <button 
            type="submit" 
            form="perfil-form" 
            disabled={isLoading} 
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Cambios'}
          </button>
        </div>

      </div>
    </>
  );
}