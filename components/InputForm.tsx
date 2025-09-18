import React, { useState, useCallback } from 'react';

interface InputFormProps {
  onSubmit: (file: File) => void;
  isLoading: boolean;
  uploadCount: number;
  uploadLimit: number;
}

const supportedFileTypes = ['application/pdf', 'text/plain', 'text/markdown'];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, uploadCount, uploadLimit }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadsRemaining = uploadLimit - uploadCount;
  const hasReachedLimit = uploadsRemaining <= 0;

  const handleFileChange = (selectedFile: File | undefined) => {
    setError(null);
    setFile(null);
    if (selectedFile) {
      if (!supportedFileTypes.includes(selectedFile.type)) {
        setError(`Tipo de archivo no soportado. Por favor, suba un .pdf, .txt, o .md`);
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        setError(`El archivo es demasiado grande. El tamaño máximo es de ${MAX_FILE_SIZE_MB} MB.`);
        return;
      }
      setFile(selectedFile);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasReachedLimit) setIsDragOver(true);
  }, [hasReachedLimit]);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (!hasReachedLimit) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, [hasReachedLimit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file && !hasReachedLimit) {
      onSubmit(file);
    }
  };

  return (
    <div className="bg-[#fdfbf7] p-6 border border-gray-300">
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mb-3">
            <label htmlFor="document-upload" className="block text-xl font-semibold text-gray-700">
            Subir Documento para Indexar:
            </label>
            <div className="font-lato text-sm text-gray-600">
                Subidas restantes hoy: <span className="font-bold text-archive-teal">{uploadsRemaining} / {uploadLimit}</span>
            </div>
        </div>
        
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg transition-colors duration-200
            ${isDragOver ? 'border-archive-teal bg-teal-50' : 'border-gray-400 bg-white'}
            ${hasReachedLimit ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input
            id="document-upload"
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
            accept=".pdf,.txt,.md"
            disabled={isLoading || hasReachedLimit}
          />
          <div className="text-center font-lato">
            {hasReachedLimit ? (
                 <p className="text-gray-600">Has alcanzado tu límite diario de subidas.</p>
            ) : (
                <>
                    <p className="text-gray-600">
                    <span className="font-semibold text-archive-teal">Haga clic para subir</span> o arrastre y suelte
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Soportado: PDF, TXT, MD (Máx {MAX_FILE_SIZE_MB}MB)</p>
                    {file && <p className="text-sm font-semibold text-gray-800 mt-4">{file.name}</p>}
                </>
            )}
          </div>
        </div>
        {error && <p className="text-red-600 text-sm mt-2 font-lato">{error}</p>}
        <button
          type="submit"
          disabled={isLoading || !file || hasReachedLimit}
          className="mt-4 w-full bg-archive-teal text-white font-bold py-3 px-4 hover:bg-archive-teal-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out flex items-center justify-center font-lato text-lg"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </>
          ) : (
            'Analizar e Indexar Documento'
          )}
        </button>
      </form>
    </div>
  );
};