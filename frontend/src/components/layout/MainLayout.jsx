// Archivo: src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function MainLayout() {
  // Estado para controlar el Sidebar en dispositivos móviles
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#FAFBFC] text-slate-800 font-sans overflow-hidden">
      
      {/* Menú Lateral */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Área Principal */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden min-w-0">
        
        {/* Barra Superior */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Contenedor del contenido de las páginas (Outlet) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 z-0">
          {/* Aquí se renderizará el componente de la ruta activa (Ej: Dashboard) */}
          <Outlet />
        </div>
        
      </main>
    </div>
  );
}