import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { NewsModal } from './NewsModal';
import { toast } from 'react-hot-toast';
import { getAuthUser } from '../../lib/auth';
import { ROLES } from '../ProtectedRoute';

interface News {
  id: number;
  titulo: string;
  subtitulo: string;
  contenido: string;
  imagen_url: string;
  usuario_id: number;
  created_at: string;
  usuarios: {
    nombre: string;
    apellido: string;
  };
  noticias_validacion: {
    estado: string;
    editor_id: number;
    created_at: string;
  }[];
  noticias_etiquetas: {
    etiquetas: {
      id: number;
      nombre: string;
    };
  }[];
}

export const NewsManagement: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const user = getAuthUser();

  useEffect(() => {
    loadNews();
  }, [filter]);

  const loadNews = async () => {
    try {
      // Primero, obtenemos los IDs de las noticias con su estado más reciente
      const { data: validationStates, error: validationError } = await supabase
        .from('noticias_validacion')
        .select('noticia_id, estado, created_at')
        .order('created_at', { ascending: false });

      if (validationError) throw validationError;

      // Creamos un mapa con el estado más reciente de cada noticia
      const latestStates = validationStates?.reduce((acc: Record<number, string>, curr) => {
        if (!acc[curr.noticia_id]) {
          acc[curr.noticia_id] = curr.estado;
        }
        return acc;
      }, {});

      // Construimos la consulta principal
      let query = supabase
        .from('noticias')
        .select(`
          *,
          usuarios (nombre, apellido),
          noticias_validacion (
            estado,
            editor_id,
            created_at
          ),
          noticias_etiquetas (
            etiquetas (id, nombre)
          )
        `)
        .order('created_at', { ascending: false });

      // Aplicamos el filtro si es necesario
      if (filter !== 'all' && latestStates) {
        const filteredIds = Object.entries(latestStates)
          .filter(([_, estado]) => estado === filter)
          .map(([id]) => parseInt(id));

        query = query.in('id', filteredIds);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Ordenamos las validaciones por fecha y nos quedamos con la más reciente
      const processedNews = data?.map(item => ({
        ...item,
        noticias_validacion: item.noticias_validacion
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 1)
      }));

      setNews(processedNews || []);
    } catch (error) {
      console.error('Error cargando noticias:', error);
      toast.error('Error al cargar noticias');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (newsId: number) => {
    try {
      const { error } = await supabase
        .from('noticias_validacion')
        .insert({
          noticia_id: newsId,
          editor_id: user?.id,
          estado: 'approved'
        });

      if (error) throw error;
      toast.success('Noticia aprobada y publicada');
      loadNews();
    } catch (error) {
      console.error('Error aprobando noticia:', error);
      toast.error('Error al aprobar noticia');
    }
  };

  const handleReject = async (newsId: number) => {
    try {
      const { error } = await supabase
        .from('noticias_validacion')
        .insert({
          noticia_id: newsId,
          editor_id: user?.id,
          estado: 'rejected'
        });

      if (error) throw error;
      toast.success('Noticia rechazada');
      loadNews();
    } catch (error) {
      console.error('Error rechazando noticia:', error);
      toast.error('Error al rechazar noticia');
    }
  };

  const handleDelete = async (newsId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta noticia?')) return;

    try {
      const { error } = await supabase
        .from('noticias')
        .delete()
        .eq('id', newsId);

      if (error) throw error;
      toast.success('Noticia eliminada correctamente');
      loadNews();
    } catch (error) {
      console.error('Error eliminando noticia:', error);
      toast.error('Error al eliminar noticia');
    }
  };

  const handleEdit = (news: News) => {
    setSelectedNews(news);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedNews(null);
  };

  const handleNewsSaved = () => {
    loadNews();
    handleModalClose();
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      approved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Aprobada'
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Rechazada'
      },
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Pendiente'
      }
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
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
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Noticias</h2>
          <p className="text-gray-600 mt-1">Administra y modera las noticias del sitio</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          >
            <option value="all">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobadas</option>
            <option value="rejected">Rechazadas</option>
          </select>
          {user?.rol_id === ROLES.ADMIN && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Nueva Noticia
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {news.map((item) => {
          const status = item.noticias_validacion?.[0]?.estado || 'pending';
          return (
            <div
              key={item.id}
              className={`bg-gray-50 rounded-lg p-6 hover:shadow-md transition-all duration-300 
                         ${status === 'approved' ? 'border-l-4 border-green-500' :
                           status === 'rejected' ? 'border-l-4 border-red-500' :
                           'border-l-4 border-yellow-500'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex space-x-4">
                  <img
                    src={item.imagen_url || 'https://via.placeholder.com/150'}
                    alt={item.titulo}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold text-gray-800">{item.titulo}</h3>
                      {getStatusBadge(status)}
                    </div>
                    <p className="text-gray-600 mt-1">{item.subtitulo}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="text-sm text-gray-500">Por:</span>
                      <span className="text-sm font-medium">
                        {item.usuarios.nombre} {item.usuarios.apellido}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.noticias_etiquetas?.map((tag) => (
                        <span
                          key={tag.etiquetas.id}
                          className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
                        >
                          {tag.etiquetas.nombre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                        title="Aprobar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Rechazar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  )}
                  {user?.rol_id === ROLES.ADMIN && (
                    <>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div>
                  Creada: {new Date(item.created_at).toLocaleDateString('es-CL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                {status !== 'pending' && (
                  <div>
                    {status === 'approved' ? 'Aprobada' : 'Rechazada'} el:{' '}
                    {new Date(item.noticias_validacion[0].created_at).toLocaleDateString('es-CL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {news.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay noticias</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' ? 'Comienza creando una nueva noticia.' :
               filter === 'pending' ? 'No hay noticias pendientes de revisión.' :
               filter === 'approved' ? 'No hay noticias aprobadas.' :
               'No hay noticias rechazadas.'}
            </p>
          </div>
        )}
      </div>

      <NewsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleNewsSaved}
        news={selectedNews}
      />
    </div>
  );
};