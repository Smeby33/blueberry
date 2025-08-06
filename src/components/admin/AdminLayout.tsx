import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { MenuIcon, XIcon, BellIcon, UserIcon, LogOutIcon, SearchIcon } from 'lucide-react';
export function AdminLayout({
  user
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté ou n'est pas admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return <div className="flex h-screen bg-gray-100">
      {/* Sidebar pour mobile */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-[#00559b] h-full">
          <div className="flex items-center justify-between h-16 px-4 bg-[#2b5a67]">
            <div className="text-xl font-bold text-white">
             BLUEBERRY Admin
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-white">
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          <AdminSidebar className="flex-1 overflow-y-auto" mobile={true} />
        </div>
      </div>
      {/* Sidebar pour desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-1 h-0">
            <div className="flex items-center h-16 px-4 bg-[#2b5a67]">
              <div className="text-xl font-bold text-white">
               BLUEBERRY Admin
              </div>
            </div>
            <AdminSidebar className="flex-1 overflow-y-auto" />
          </div>
        </div>
      </div>
      {/* Contenu principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Barre supérieure */}
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <div className="flex items-center md:hidden">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-500 focus:outline-none">
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="hidden md:block md:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="w-5 h-5 text-gray-400" />
              </div>
              <input type="text" placeholder="Rechercher..." className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00559b]" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-1 text-gray-500 rounded-full hover:bg-gray-100">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="relative">
              <button className="flex items-center text-sm text-gray-700 focus:outline-none">
                <span className="mr-2 hidden md:block">
                  {user?.name || 'Admin'}
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                </div>
              </button>
            </div>
          </div>
        </header>
        {/* Contenu de la page */}
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <div className="py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>;
}