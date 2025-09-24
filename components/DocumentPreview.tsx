import React, { useEffect } from 'react';
import { DocumentData } from '../types';

interface DocumentPreviewProps {
  document: DocumentData;
  onClose: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, onClose }) => {
  // Cierra la vista previa al presionar la tecla Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const renderPreviewContent = () => {
    const fileName = document.fileName.toLowerCase();
    const fileUrl = document.fileUrl;

    if (fileName.endsWith('.mp4') || fileName.endsWith('.webm') || fileName.endsWith('.ogv')) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <video src={fileUrl} controls className="max-w-full max-h-full">
            Tu navegador no soporta la etiqueta de video.
          </video>
        </div>
      );
    }

    if (fileName.endsWith('.mp3') || fileName.endsWith('.wav') || fileName.endsWith('.ogg')) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          <div className="w-full max-w-lg p-8">
            <audio src={fileUrl} controls className="w-full">
              Tu navegador no soporta la etiqueta de audio.
            </audio>
          </div>
        </div>
      );
    }
    
    // Default to iframe for PDF, TXT, etc.
    return (
      <iframe
        src={fileUrl}
        title={document.title}
        className="w-full h-full border-none"
      />
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 sm:p-8 animate-fade-in"
      onClick={onClose} // Cierra al hacer clic en el fondo
    >
      {/* Botón para cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50"
        aria-label="Cerrar vista previa"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Contenido del modal (el visor del documento) */}
      <div
        className="bg-white w-full h-full max-w-6xl flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal lo cierre
      >
        <div className="bg-[#333] p-3 text-white font-lato flex justify-between items-center">
            <h3 className="text-lg truncate mr-4">{document.title}</h3>
            <a
                href={document.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 flex items-center text-white hover:text-gray-300 transition-colors"
                title="Abrir en una nueva pestaña"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="ml-2 hidden sm:inline">Abrir Original</span>
            </a>
        </div>
        <div className="flex-grow bg-gray-200 overflow-hidden">
            {renderPreviewContent()}
        </div>
      </div>
    </div>
  );
};
