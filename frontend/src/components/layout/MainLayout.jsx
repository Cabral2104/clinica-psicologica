// Archivo: src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import NuevoPacienteSlideover from '../patients/NuevoPacienteSlideover'; // Importamos el nuevo componente

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Estado para controlar la apertura del formulario de paciente
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);

  // Función que se dispara cuando el paciente se guarda correctamente
  const handlePatientSuccess = () => {
    // Aquí podrías usar un Toast (notificación) para avisar del éxito.
    // Para reflejar los datos inmediatamente, la forma más sencilla es recargar,
    // aunque en React idealmente se dispara un evento o se usa React Query.
    window.location.reload(); 
  };

  return (
    <div className="flex h-screen w-full bg-[#FAFBFC] text-slate-800 font-sans overflow-hidden">
      
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden min-w-0">
        
        {/* Pasamos la función de apertura al Navbar */}
        <Navbar 
          onMenuClick={() => setSidebarOpen(true)} 
          onOpenNewPatient={() => setIsNewPatientOpen(true)}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 z-0">
          <Outlet />
        </div>
        
      </main>

      {/* Renderizamos el panel flotante fuera del flujo del contenido */}
      <NuevoPacienteSlideover 
        isOpen={isNewPatientOpen} 
        onClose={() => setIsNewPatientOpen(false)}
        onSuccess={handlePatientSuccess}
      />

    </div>
  );
}