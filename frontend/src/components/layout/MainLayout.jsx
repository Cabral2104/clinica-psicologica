import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import NuevoPacienteSlideover from '../patients/NuevoPacienteSlideover'; 
import EditarPerfilSlideover from './EditarPerfilSlideover'; // Importamos el modal del perfil aquí

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Estados para controlar los Slideovers
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handlePatientSuccess = () => {
    window.location.reload(); 
  };

  return (
    <div className="flex h-screen w-full bg-[#FAFBFC] text-slate-800 font-sans overflow-hidden">
      
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden min-w-0">
        
        {/* Pasamos las funciones de apertura al Navbar */}
        <Navbar 
          onMenuClick={() => setSidebarOpen(true)} 
          onOpenNewPatient={() => setIsNewPatientOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)} // Nueva función pasada por prop
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 z-0">
          <Outlet />
        </div>
        
      </main>

      {/* Renderizamos TODOS los paneles flotantes fuera del flujo del contenido principal */}
      <NuevoPacienteSlideover 
        isOpen={isNewPatientOpen} 
        onClose={() => setIsNewPatientOpen(false)}
        onSuccess={handlePatientSuccess}
      />

      <EditarPerfilSlideover 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />

    </div>
  );
}