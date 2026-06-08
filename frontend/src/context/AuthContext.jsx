// Archivo: frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = () => {
      try {
        const token = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('auth_user');

        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      } catch (error) {
        console.error("Error al restaurar la sesión local:", error);
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email, password) => {
    try {
      // Modificado para coincidir con tu ruta: base/v1 + /auth/login
      const response = await api.post('/auth/login', { email, password });
      
      const { token, user: userData } = response.data; 
      
      if (!token || !userData) {
        throw new Error('Respuesta incompleta del servidor');
      }

      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Credenciales incorrectas o error de conexión' 
      };
    }
  };

  const logout = async () => {
    try {
      // Modificado para coincidir con tu ruta: base/v1 + /auth/logout
      await api.post('/auth/logout'); 
    } catch (error) {
      console.error("Error al notificar logout al backend:", error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);