import React from 'react';

interface Tag {
  etiquetas: {
    id: number;
    nombre: string;
  };
  count: number;
}

interface TrendingTagsProps {
  tags: Tag[];
}

export const TrendingTags: React.FC<TrendingTagsProps> = ({ tags }) => {
  return (
    <div className="space-y-3">
      {tags?.map((tag, index) => (
        <a
          key={tag.etiquetas.id}
          href={`/etiqueta/${tag.etiquetas.id}`}
          className="group flex items-center justify-between p-3 rounded-lg hover:bg-red-50 
                   transition-all duration-300 transform hover:scale-102 hover:shadow-md"
          style={{
            animationDelay: `${index * 100}ms`,
            animation: 'fadeInUp 0.5s ease-out forwards'
          }}
        >
          <div className="flex items-center space-x-2">
            <span className="text-red-600 font-medium group-hover:text-red-700 transition-colors">
              #{tag.etiquetas.nombre}
            </span>
            <div className="w-2 h-2 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 
                          transform scale-0 group-hover:scale-100 transition-all duration-300"></div>
          </div>
          <span className="text-sm text-gray-500 group-hover:text-red-600 transition-colors">
            {tag.count} {tag.count === 1 ? 'artículo' : 'artículos'}
          </span>
        </a>
      ))}
    </div>
  );
};