import React from 'react';
import { DashboardLayout } from './DashboardLayout';

export const EditorDashboard: React.FC<{ user: any }> = ({ user }) => {
  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Panel de Editor</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Noticias Pendientes</h2>
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Revisar Noticias
            </button>
          </div>
          <div className="bg-red-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Noticias Publicadas</h2>
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Ver Historial
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};