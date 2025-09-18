import React from 'react';
import { DocumentData } from '../types';

interface DocumentCardProps {
  document: DocumentData;
  onSelect: (document: DocumentData) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onSelect }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div 
      className="bg-[#fdfbf7] border border-gray-300 p-5 cursor-pointer hover:border-archive-teal hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
      onClick={() => onSelect(document)}
    >
      <div>
        <p className="text-xs text-gray-500 font-lato mb-1">{document.category}</p>
        <h4 className="text-xl font-semibold text-gray-800 font-garamond mb-2 line-clamp-2">{document.title}</h4>
        <p className="text-sm text-gray-600 font-lato line-clamp-3">{document.summary}</p>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
         <div>
            <p className="text-xs text-gray-500 font-lato">Indexado el: {formatDate(document.created_at)}</p>
            {document.authorEmail && (
                <p className="text-xs text-gray-500 font-lato mt-1 truncate">
                    Por: <span className="font-semibold">{document.authorEmail}</span>
                </p>
            )}
         </div>
         <a 
            href={document.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={(e) => e.stopPropagation()} 
            className="p-1 text-gray-400 hover:text-archive-teal transition-colors"
            aria-label="Abrir documento en una nueva pestaña"
            title="Abrir en una nueva pestaña"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
        </a>
      </div>
    </div>
  );
};