import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface Tag {
  id?: number;
  nombre: string;
}

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  tag: Tag | null;
}

export const TagModal: React.FC<TagModalProps> = ({
  isOpen,
  onClose,
  onSave,
  tag
}) => {
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tag) {
      setNombre(tag.nombre);
    } else {
      setNombre('');
    }
  }, [tag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!nombre.trim()) {
        toast.error('El nombre de la etiqueta es requerido');
        return;
      }

      // Verificar si ya existe una etiqueta con ese nombre
      const { data: existingTag } = await supabase
        .from('etiquetas')
        .select('id')
        .eq('nombre', nombre.trim())
        .neq('id', tag?.id || 0)
        .single();

      if (existingTag) {
        toast.error('Ya existe una etiqueta con ese nombre');
        return;
      }

      if (tag?.id) {
        // Actualizar etiqueta existente
        const { error } = await supabase
          .from('etiquetas')
          .update({ nombre: nombre.trim() })
          .eq('id', tag.id);

        if (error) throw error;
        toast.success('Etiqueta actualizada correctamente');
      } else {
        // Crear nueva etiqueta
        const { error } = await supabase
          .from('etiquetas')
          .insert([{ nombre: nombre.trim() }]);

        if (error) throw error;
        toast.success('Etiqueta creada correctamente');
      }

      onSave();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar la etiqueta');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">
          {tag ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre de la Etiqueta
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">#</span>
              </span>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm 
                         focus:border-red-500 focus:ring-red-500"
                placeholder="deportes"
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Use nombres cortos y descriptivos para las etiquetas
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