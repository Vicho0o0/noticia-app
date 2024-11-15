import React, { useState, useEffect } from 'react';
import { removeAuthUser, getAuthUser } from '../../lib/auth';
import { toast } from 'react-hot-toast';
import { ROLES } from '../ProtectedRoute';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: 'admin' | 'editor' | 'writer' | 'user';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role = 'user' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPath, setCurrentPath] = useState('');
  const user = getAuthUser();

  useEffect(() => {
    const updateCurrentPath = () => {
      setCurrentPath(window.location.pathname);
    };

    updateCurrentPath();
    window.addEventListener('popstate', updateCurrentPath);

    const observer = new MutationObserver(updateCurrentPath);
    observer.observe(document.querySelector('head > base') || document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true
    });

    return () => {
      window.removeEventListener('popstate', updateCurrentPath);
      observer.disconnect();
    };
  }, []);

  const handleLogout = () => {
    removeAuthUser();
    toast.success('Sesión cerrada correctamente');
    window.location.href = '/';
  };

  const menuItems = {
    admin: [
      { icon: '📊', label: 'Panel General', href: '/dashboard' },
      { icon: '👥', label: 'Usuarios', href: '/dashboard/users' },
      { icon: '📰', label: 'Noticias', href: '/dashboard/news' },
      { icon: '🏷️', label: 'Etiquetas', href: '/dashboard/tags' },
      { icon: '👮', label: 'Roles', href: '/dashboard/roles' },
      { icon: '📈', label: 'Estadísticas', href: '/dashboard/stats' },
      { icon: '⚙️', label: 'Configuración', href: '/dashboard/settings' },
    ],
    editor: [
      { icon: '📊', label: 'Panel General', href: '/dashboard' },
      { icon: '📝', label: 'Noticias Pendientes', href: '/dashboard/pending' },
      { icon: '✅', label: 'Noticias Aprobadas', href: '/dashboard/approved' },
      { icon: '📈', label: 'Estadísticas', href: '/dashboard/stats' },
      { icon: '⚙️', label: 'Configuración', href: '/dashboard/settings' },
    ],
    writer: [
      { icon: '📊', label: 'Panel General', href: '/dashboard' },
      { icon: '✍️', label: 'Crear Noticia', href: '/dashboard/create' },
      { icon: '📰', label: 'Mis Noticias', href: '/dashboard/my-news' },
      { icon: '📈', label: 'Estadísticas', href: '/dashboard/stats' },
      { icon: '⚙️', label: 'Configuración', href: '/dashboard/settings' },
    ],
    user: [
      { icon: '📊', label: 'Panel General', href: '/dashboard' },
      { icon: '👤', label: 'Mi Perfil', href: '/dashboard/profile' },
      { icon: '🔖', label: 'Guardados', href: '/dashboard/saved' },
      { icon: '⚙️', label: 'Configuración', href: '/dashboard/settings' },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Ahora con position fixed */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out
                   ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                   lg:translate-x-0 w-72 bg-gradient-to-b from-gray-900 to-gray-800
                   text-white shadow-xl overflow-hidden flex flex-col`}
      >
        {/* Logo y Título */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-700">
          <a href="/" className="flex items-center space-x-3">
            <img src="/logo.png" alt="La Cuarta" className="h-8 w-auto" />
          </a>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Perfil del Usuario */}
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-lg font-bold">{user?.nombre.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.nombre} {user?.apellido}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Menú de Navegación - Con scroll independiente */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <div className="space-y-1">
            {menuItems[role].map((item, index) => {
              const isActive = currentPath === item.href;
              return (
                <a
                  key={index}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                            ${isActive 
                              ? 'bg-red-600 text-white shadow-lg scale-105 font-medium' 
                              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white hover:scale-102'}`}
                  onClick={(e) => {
                    setCurrentPath(item.href);
                  }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </nav>

        {/* Botón de Cerrar Sesión */}
        <div className="p-4 border-t border-gray-700 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 
                     bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300
                     hover:scale-105 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal - Con margen izquierdo para la sidebar */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : ''}`}>
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 
                       hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex-1 px-4 lg:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">
                {menuItems[role].find(item => item.href === currentPath)?.label || 'Panel de Control'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full
                               transition-all duration-300 hover:scale-110">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Contenido - Con padding para separar del header */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};