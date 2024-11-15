import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { ROLES } from '../ProtectedRoute';

interface User {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  contraseña?: string;
  rol_id: number;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  user: User | null;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user
}) => {
  const [formData, setFormData] = useState<User>({
    nombre: '',
    apellido: '',
    email: '',
    contraseña: '',
    rol_id: ROLES.USUARIO
  });

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        contraseña: '' // No mostramos la contraseña actual
      });
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        contraseña: '',
        rol_id: ROLES.USUARIO
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rol_id' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (user?.id) {
        // Preparar datos para actualización (excluir id y campos no modificables)
        const updateData: Partial<User> = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          rol_id: formData.rol_id
        };

        // Solo incluir contraseña si se ha modificado
        if (formData.contraseña) {
          updateData.contraseña = formData.contraseña;
        }

        const { error } = await supabase
          .from('usuarios')
          .update(updateData)
          .eq('id', user.id);

        if (error) throw error;
        toast.success('Usuario actualizado correctamente');
      } else {
        // Para nuevos usuarios, incluir todos los campos requeridos
        const { error } = await supabase
          .from('usuarios')
          .insert([{
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email,
            contraseña: formData.contraseña,
            rol_id: formData.rol_id
          }]);

        if (error) throw error;
        toast.success('Usuario creado correctamente');
      }

      onSave();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar usuario');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">
          {user ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Apellido
            </label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contraseña {user && '(dejar en blanco para mantener)'}
            </label>
            <input
              type="password"
              name="contraseña"
              value={formData.contraseña}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              {...(!user && { required: true })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Rol
            </label>
            <select
              name="rol_id"
              value={formData.rol_id}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            >
              <option value={ROLES.USUARIO}>Usuario</option>
              <option value={ROLES.ESCRITOR}>Escritor</option>
              <option value={ROLES.EDITOR}>Editor</option>
              <option value={ROLES.ADMIN}>Administrador</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};