import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getAuthUser } from '../lib/auth';
import { toast } from 'react-hot-toast';

interface Comment {
  id: number;
  contenido: string;
  created_at: string;
  usuario_id: number;
  usuarios: {
    nombre: string;
    apellido: string;
  };
  votos_positivos: number;
  votos_negativos: number;
}

export const CommentSection: React.FC<{ noticiaId: number }> = ({ noticiaId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const user = getAuthUser();

  useEffect(() => {
    loadComments();
  }, [noticiaId]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comentarios')
        .select(`
          *,
          usuarios (nombre, apellido)
        `)
        .eq('noticia_id', noticiaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error cargando comentarios:', error);
      toast.error('Error al cargar los comentarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Debes iniciar sesión para comentar');
      return;
    }

    if (!newComment.trim()) {
      toast.error('El comentario no puede estar vacío');
      return;
    }

    try {
      const { error } = await supabase
        .from('comentarios')
        .insert([
          {
            noticia_id: noticiaId,
            usuario_id: user.id,
            contenido: newComment.trim()
          }
        ]);

      if (error) throw error;

      toast.success('Comentario publicado');
      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Error al comentar:', error);
      toast.error('Error al publicar el comentario');
    }
  };

  const handleVote = async (commentId: number, isPositive: boolean) => {
    if (!user) {
      toast.error('Debes iniciar sesión para votar');
      return;
    }

    try {
      const { data: existingVote } = await supabase
        .from('votos_comentarios')
        .select('*')
        .eq('comentario_id', commentId)
        .eq('usuario_id', user.id)
        .single();

      if (existingVote) {
        toast.error('Ya has votado en este comentario');
        return;
      }

      const { error } = await supabase
        .from('votos_comentarios')
        .insert([
          {
            comentario_id: commentId,
            usuario_id: user.id,
            es_positivo: isPositive
          }
        ]);

      if (error) throw error;

      // Actualizar el contador en el comentario
      const field = isPositive ? 'votos_positivos' : 'votos_negativos';
      await supabase
        .from('comentarios')
        .update({ [field]: supabase.sql`${field} + 1` })
        .eq('id', commentId);

      loadComments();
      toast.success('Voto registrado');
    } catch (error) {
      console.error('Error al votar:', error);
      toast.error('Error al registrar el voto');
    }
  };

  const canModifyComment = (comment: Comment) => {
    return user?.id === comment.usuario_id || user?.rol_id === 1; // 1 es el ID del rol admin
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('¿Estás seguro de eliminar este comentario?')) return;

    try {
      const { error } = await supabase
        .from('comentarios')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      toast.success('Comentario eliminado');
      loadComments();
    } catch (error) {
      console.error('Error eliminando comentario:', error);
      toast.error('Error al eliminar el comentario');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="text-white space-y-6">
      <h3 className="text-xl font-bold mb-4">Comentarios</h3>
      
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg 
                     text-white placeholder-white/60 focus:ring-2 focus:ring-red-500 
                     focus:border-red-500"
            placeholder="Escribe un comentario..."
            rows={3}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                     transition-colors duration-200"
          >
            Comentar
          </button>
        </form>
      ) : (
        <div className="text-center py-4 bg-white/10 rounded-lg">
          <p>Debes <a href="/login" className="text-red-400 hover:underline">iniciar sesión</a> para comentar</p>
        </div>
      )}

      <div className="space-y-4 mt-6">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white/10 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="font-bold text-sm">
                    {comment.usuarios.nombre.charAt(0)}
                  </span>
                </div>
                <span className="font-medium">
                  {comment.usuarios.nombre} {comment.usuarios.apellido}
                </span>
                {comment.usuario_id === user?.id && (
                  <span className="text-xs bg-red-600 px-2 py-0.5 rounded-full">Autor</span>
                )}
              </div>
              <span className="text-sm text-gray-400">
                {new Date(comment.created_at).toLocaleDateString('es-CL', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <p className="mt-2">{comment.contenido}</p>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => handleVote(comment.id, true)}
                  className="flex items-center space-x-1 text-gray-400 hover:text-green-400 transition-colors"
                  disabled={!user}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                  </svg>
                  <span>{comment.votos_positivos || 0}</span>
                </button>
                <button 
                  onClick={() => handleVote(comment.id, false)}
                  className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors"
                  disabled={!user}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>{comment.votos_negativos || 0}</span>
                </button>
              </div>
              
              {canModifyComment(comment) && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="Eliminar comentario"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">No hay comentarios aún. ¡Sé el primero en comentar!</p>
          </div>
        )}
      </div>
    </div>
  );
};