// Archivo: src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Pacientes from './pages/patients/Pacientes'; 
import Agenda from './pages/agenda/Agenda'; // <-- Corregido con la "A" mayúscula

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pacientes" element={<Pacientes />} />
              
              {/* <-- Reemplazamos el div estático por el componente real de FullCalendar --> */}
              <Route path="/agenda" element={<Agenda />} />
              
              <Route path="/analisis-ia" element={<div className="p-8 font-bold">Análisis NLP...</div>} />
              <Route path="/expedientes" element={<div className="p-8 font-bold">Expedientes...</div>} />
              <Route path="/reportes" element={<div className="p-8 font-bold">Reportes...</div>} />
            </Route>
          </Route>

          <Route path="*" element={
            <div className="flex h-screen items-center justify-center font-bold text-slate-400">404 - No encontrada</div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;