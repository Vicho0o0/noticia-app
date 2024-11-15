import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface Role {
  id?: number;
  nombre: string;
}

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  role: Role | null;
}

export const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  role
}) => {
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) {
      setNombre(role.nombre);
    } else {
      setNombre('');
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!nombre.trim()) {
        toast.error('El nombre del rol es requerido');
        return;
      }

      // Verificar si ya existe un rol con ese nombre
      const { data: existingRole } = await supabase
        .from('roles')
        .select('id')
        .eq('nombre', nombre.trim())
        .neq('id', role?.id || 0)
        .single();

      if (existingRole) {
        toast.error('Ya existe un rol con ese nombre');
        return;
      }

      if (role?.id) {
        // Actualizar rol existente
        const { error } = await supabase
          .from('roles')
          .update({ nombre: nombre.trim() })
          .eq('id', role.id);

        if (error) throw error;
        toast.success('Rol actualizado correctamente');
      } else {
        // Crear nuevo rol
        const { error } = await supabase
          .from('roles')
          .insert([{ nombre: nombre.trim() }]);

        if (error) throw error;
        toast.success('Rol creado correctamente');
      }

      onSave();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar el rol');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">
          {role ? 'Editar Rol' : 'Nuevo Rol'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre del Rol
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-red-500 focus:ring-red-500"
              placeholder="Administrador"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              El nombre debe ser descriptivo y único
            </p>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg 
                       hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-red-600 rounded-lg 
                       hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};