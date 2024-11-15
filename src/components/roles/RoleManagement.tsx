import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { RoleModal } from './RoleModal';
import { toast } from 'react-hot-toast';

interface Role {
  id: number;
  nombre: string;
  _count?: {
    usuarios: number;
  }
}

export const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      // Obtener roles y contar usuarios asociados
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select(`
          *,
          usuarios (id)
        `)
        .order('id');

      if (rolesError) throw rolesError;

      // Procesar los datos para contar usuarios
      const rolesWithCount = rolesData?.map(role => ({
        ...role,
        _count: {
          usuarios: role.usuarios?.length || 0
        }
      }));

      setRoles(rolesWithCount || []);
    } catch (error) {
      console.error('Error cargando roles:', error);
      toast.error('Error al cargar roles');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleDelete = async (roleId: number) => {
    // Verificar si hay usuarios con este rol
    const role = roles.find(r => r.id === roleId);
    if (role?._count?.usuarios && role._count.usuarios > 0) {
      toast.error(`No se puede eliminar el rol porque tiene ${role._count.usuarios} usuarios asociados`);
      return;
    }

    if (!confirm('¿Estás seguro de eliminar este rol?')) return;

    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast.success('Rol eliminado correctamente');
      loadRoles();
    } catch (error) {
      console.error('Error eliminando rol:', error);
      toast.error('Error al eliminar rol');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRole(null);
  };

  const handleRoleSaved = () => {
    loadRoles();
    handleModalClose();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Roles</h2>
          <p className="text-gray-600 mt-1">Administra los roles del sistema</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Rol
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow relative group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{role.nombre}</h3>
                <p className="text-sm text-gray-600">
                  {role._count?.usuarios} {role._count?.usuarios === 1 ? 'usuario' : 'usuarios'} asignados
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ID: {role.id}
                </p>
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                <button
                  onClick={() => handleEdit(role)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Editar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(role.id)}
                  className={`p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors ${
                    role._count?.usuarios ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title={role._count?.usuarios ? 'No se puede eliminar - Tiene usuarios asignados' : 'Eliminar'}
                  disabled={role._count?.usuarios > 0}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {roles.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay roles</h3>
          <p className="mt-1 text-sm text-gray-500">Comienza creando un nuevo rol.</p>
        </div>
      )}

      <RoleModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleRoleSaved}
        role={selectedRole}
      />
    </div>
  );
};