import React from 'react';
import { DashboardLayout } from './DashboardLayout';

export const UserDashboard: React.FC<{ user: any }> = ({ user }) => {
  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-red-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Información Personal</h2>
            <div className="space-y-4">
              <p><strong>Nombre:</strong> {user.nombre} {user.apellido}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Editar Perfil
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};