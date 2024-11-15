import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { TagModal } from './TagModal';
import { toast } from 'react-hot-toast';

interface Tag {
  id: number;
  nombre: string;
  created_at: string;
  _count?: {
    noticias: number;
  };
}

export const TagManagement: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      // Obtener etiquetas y contar noticias asociadas
      const { data: tagsData, error: tagsError } = await supabase
        .from('etiquetas')
        .select(`
          *,
          noticias_etiquetas (
            noticia_id
          )
        `)
        .order('nombre');

      if (tagsError) throw tagsError;

      // Procesar los datos para contar noticias
      const tagsWithCount = tagsData?.map(tag => ({
        ...tag,
        _count: {
          noticias: tag.noticias_etiquetas?.length || 0
        }
      }));

      setTags(tagsWithCount || []);
    } catch (error) {
      console.error('Error cargando etiquetas:', error);
      toast.error('Error al cargar etiquetas');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag);
    setIsModalOpen(true);
  };

  const handleDelete = async (tagId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta etiqueta? Se eliminará de todas las noticias asociadas.')) return;

    try {
      const { error } = await supabase
        .from('etiquetas')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      toast.success('Etiqueta eliminada correctamente');
      loadTags();
    } catch (error) {
      console.error('Error eliminando etiqueta:', error);
      toast.error('Error al eliminar etiqueta');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTag(null);
  };

  const handleTagSaved = () => {
    loadTags();
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
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Etiquetas</h2>
          <p className="text-gray-600 mt-1">Administra las etiquetas para categorizar las noticias</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Etiqueta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow relative group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">#{tag.nombre}</h3>
                <p className="text-sm text-gray-600">
                  {tag._count?.noticias} {tag._count?.noticias === 1 ? 'noticia' : 'noticias'} asociadas
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Creada el {new Date(tag.created_at).toLocaleDateString('es-CL')}
                </p>
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                <button
                  onClick={() => handleEdit(tag)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Editar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(tag.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Eliminar"
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

      {tags.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay etiquetas</h3>
          <p className="mt-1 text-sm text-gray-500">Comienza creando una nueva etiqueta.</p>
        </div>
      )}

      <TagModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleTagSaved}
        tag={selectedTag}
      />
    </div>
  );
};