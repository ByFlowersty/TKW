import React, { useState } from 'react';
import { DocumentData } from '../types';
import { DocumentCard } from './DocumentCard';
import { DocumentPreview } from './DocumentPreview';

interface KnowledgeBankProps {
  documents: DocumentData[];
  isLoading: boolean;
  title: string;
}

export const KnowledgeBank: React.FC<KnowledgeBankProps> = ({ documents, isLoading, title }) => {
  const [selectedDocument, setSelectedDocument] = useState<DocumentData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelectDocument = (doc: DocumentData) => {
    setSelectedDocument(doc);
  };

  const handleClosePreview = () => {
    setSelectedDocument(null);
  };

  const filteredDocuments = documents.filter((doc) => {
    const searchTermLower = searchTerm.toLowerCase();
    const searchCorpus = `${doc.title} ${doc.summary} ${doc.category} ${doc.keywords.join(' ')}`.toLowerCase();
    return searchCorpus.includes(searchTermLower);
  });

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center text-gray-600 font-lato">Cargando archivo...</p>;
    }
    if (documents.length === 0) {
      return (
        <div className="text-center py-10 bg-[#fdfbf7] border border-gray-300">
          <p className="text-gray-700 font-lato">El banco de conocimiento está vacío.</p>
          <p className="text-gray-500 font-lato mt-2">Sube un documento para empezar a construirlo.</p>
        </div>
      );
    }
    if (filteredDocuments.length === 0) {
      return (
        <div className="text-center py-10 bg-[#fdfbf7] border border-gray-300">
          <p className="text-gray-700 font-lato">No se encontraron documentos que coincidan con su búsqueda.</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <DocumentCard key={doc.id} document={doc} onSelect={handleSelectDocument} />
        ))}
      </div>
    );
  };

  return (
    <div className="mt-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h3 className="text-3xl font-semibold text-[#333] border-b border-gray-300 pb-2 md:border-b-0">
          {title}
        </h3>
        {documents.length > 0 && (
          <div className="w-full md:w-1/3 mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Buscar por título, palabra clave..."
              className="w-full px-4 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-archive-teal font-lato"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>
      
      {renderContent()}

      {selectedDocument && (
        <DocumentPreview document={selectedDocument} onClose={handleClosePreview} />
      )}
    </div>
  );
};