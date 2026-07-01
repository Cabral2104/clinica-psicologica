import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Pacientes from './pages/patients/Pacientes'; 
import Agenda from './pages/agenda/Agenda';
import AnalisisIA from './pages/analisis/AnalisisIA'; 
import Expedientes from './pages/expedientes/Expedientes'; 

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
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/analisis-ia" element={<AnalisisIA />} />
              
              {/* <-- Reemplazamos el div estático por el componente real de Expedientes --> */}
              <Route path="/expedientes" element={<Expedientes />} />
              
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