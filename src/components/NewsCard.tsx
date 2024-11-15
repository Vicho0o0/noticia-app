import React, { useState } from 'react';
import { CommentSection } from './CommentSection';
import { getAuthUser } from '../lib/auth';

interface NewsCardProps {
  noticia: any;
  featured?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({ noticia, featured = false }) => {
  const [showComments, setShowComments] = useState(false);
  const user = getAuthUser();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://via.placeholder.com/1200x800?text=La+Cuarta';
  };

  return (
    <article 
      className={`group relative overflow-hidden rounded-xl shadow-lg transform transition-all duration-500 
                  hover:shadow-2xl ${featured ? 'h-[70vh]' : 'h-[400px]'}`}
    >
      {/* Imagen con efecto parallax */}
      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
        <img
          src={noticia.imagen_url || 'https://via.placeholder.com/1200x800?text=La+Cuarta'}
          alt={noticia.titulo}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-90"></div>
      </div>

      {/* Contenido */}
      <div className="relative h-full flex flex-col justify-end p-6 text-white">
        {/* Etiquetas con animación */}
        <div className="flex flex-wrap gap-2 mb-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          {noticia.noticias_etiquetas?.map((tag: any, index: number) => (
            <span
              key={`${tag.etiquetas.id}-${index}`}
              className="px-3 py-1 text-xs font-semibold bg-red-600 rounded-full 
                       transform hover:scale-105 transition-transform duration-200
                       hover:bg-red-500"
            >
              {tag.etiquetas.nombre}
            </span>
          ))}
        </div>

        {/* Título y subtítulo con animación */}
        <div className="space-y-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
          <h2 className={`font-bold leading-tight ${featured ? 'text-4xl md:text-5xl' : 'text-2xl'}`}>
            <a href={`/noticias/${noticia.id}`} 
               className="hover:text-red-400 transition-colors duration-300 line-clamp-3">
              {noticia.titulo}
            </a>
          </h2>
          <p className={`${featured ? 'text-xl' : 'text-base'} text-gray-200 line-clamp-2 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100`}>
            {noticia.subtitulo}
          </p>
        </div>

        {/* Metadata y acciones */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/20
                      transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center 
                            text-white font-bold border-2 border-white transform hover:scale-110 transition-transform">
                {noticia.usuarios?.nombre?.charAt(0) || 'A'}
              </div>
              <div className="flex flex-col">
                <span className="font-medium hover:text-red-400 transition-colors">
                  {noticia.usuarios?.nombre} {noticia.usuarios?.apellido}
                </span>
                <span className="text-sm text-gray-300">
                  {new Date(noticia.created_at).toLocaleDateString('es-CL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-full
                     hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span className="font-medium">Comentarios</span>
          </button>
        </div>
      </div>

      {/* Sección de comentarios con animación */}
      {showComments && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-sm transform transition-all duration-500
                      p-6 overflow-y-auto animate-fadeIn">
          <button
            onClick={() => setShowComments(false)}
            className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors
                     transform hover:rotate-90 duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <CommentSection noticiaId={noticia.id} />
        </div>
      )}
    </article>
  );
};