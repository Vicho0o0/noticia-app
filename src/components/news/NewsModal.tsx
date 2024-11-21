import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { getAuthUser } from '../../lib/auth';
import { toast } from 'react-hot-toast';

interface News {
  id?: number;
  titulo: string;
  subtitulo: string;
  contenido: string;
  imagen_url?: string;
  usuario_id: number;
  noticias_etiquetas?: {
    etiquetas: {
      id: number;
      nombre: string;
    };
  }[];
}

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  news: News | null;
}

export const NewsModal: React.FC<NewsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  news
}) => {
  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const user = getAuthUser();

  useEffect(() => {
    loadTags();
    if (news) {
      setTitulo(news.titulo);
      setSubtitulo(news.subtitulo);
      setContenido(news.contenido);
      if (news.imagen_url) {
        setImagenPreview(news.imagen_url);
      }
      setSelectedTags(news.noticias_etiquetas?.map(tag => tag.etiquetas.id) || []);
    } else {
      resetForm();
    }
  }, [news]);

  const loadTags = async () => {
    const { data, error } = await supabase
      .from('etiquetas')
      .select('*')
      .order('nombre');

    if (error) {
      console.error('Error cargando etiquetas:', error);
      toast.error('Error al cargar etiquetas');
    } else {
      setAvailableTags(data || []);
    }
  };

  const resetForm = () => {
    setTitulo('');
    setSubtitulo('');
    setContenido('');
    setImagen(null);
    setImagenPreview('');
    setSelectedTags([]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagen(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }

    setLoading(true);

    try {
      let imagen_url = news?.imagen_url;

      // Si hay una nueva imagen, la guardamos en la carpeta pública
      if (imagen) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const extension = imagen.name.split('.').pop();
        const fileName = `${timestamp}_${randomString}.${extension}`;
        
        // Copiar la imagen a la carpeta pública
        const formData = new FormData();
        formData.append('file', imagen);
        
        // Aquí va la lógica para subir la imagen
        // Por ahora, usaremos una ruta estática (sin programar)
        imagen_url = `/img_noticias/${fileName}`;
      }

      const newsData = {
        titulo,
        subtitulo,
        contenido,
        imagen_url,
        usuario_id: user.id,
        estado: 'pending' // Aseguramos que el estado se establezca
      };

      if (news?.id) {
        // Actualizar noticia existente
        const { error: updateError } = await supabase
          .from('noticias')
          .update(newsData)
          .eq('id', news.id);

        if (updateError) throw updateError;

        // Actualizar etiquetas
        if (selectedTags.length > 0) {
          // Eliminar etiquetas anteriores
          await supabase
            .from('noticias_etiquetas')
            .delete()
            .eq('noticia_id', news.id);

          // Insertar nuevas etiquetas
          const etiquetasData = selectedTags.map(tagId => ({
            noticia_id: news.id,
            etiqueta_id: tagId
          }));

          const { error: tagsError } = await supabase
            .from('noticias_etiquetas')
            .insert(etiquetasData);

          if (tagsError) throw tagsError;
        }

        toast.success('Noticia actualizada correctamente');
      } else {
        // Crear nueva noticia
        const { data: newNews, error: insertError } = await supabase
          .from('noticias')
          .insert([newsData])
          .select()
          .single();

        if (insertError) throw insertError;

        // Insertar etiquetas
        if (selectedTags.length > 0 && newNews) {
          const etiquetasData = selectedTags.map(tagId => ({
            noticia_id: newNews.id,
            etiqueta_id: tagId
          }));

          const { error: tagsError } = await supabase
            .from('noticias_etiquetas')
            .insert(etiquetasData);

          if (tagsError) throw tagsError;
        }

        // Crear registro de validación pendiente
        const { error: validationError } = await supabase
          .from('noticias_validacion')
          .insert([{
            noticia_id: newNews.id,
            editor_id: user.id,
            estado: 'pending'
          }]);

        if (validationError) throw validationError;

        toast.success('Noticia creada correctamente');
      }

      onSave();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar la noticia');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-6">
          {news ? 'Editar Noticia' : 'Nueva Noticia'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          {/* Subtítulo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subtítulo
            </label>
            <input
              type="text"
              value={subtitulo}
              onChange={(e) => setSubtitulo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          {/* Contenido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenido
            </label>
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              rows={10}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                {imagenPreview ? (
                  <div className="relative">
                    <img
                      src={imagenPreview.startsWith('data:') ? imagenPreview : imagenPreview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagen(null);
                        setImagenPreview('');
                      }}
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500">
                        <span>Subir imagen</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">o arrastra y suelta</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Etiquetas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiquetas
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    setSelectedTags(prev =>
                      prev.includes(tag.id)
                        ? prev.filter(id => id !== tag.id)
                        : [...prev, tag.id]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
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