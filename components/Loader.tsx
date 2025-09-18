import React from 'react';

interface LoaderProps {
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message = 'Cargando...' }) => {
  return (
    <div className="flex flex-col items-center justify-center my-10">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-archive-teal"></div>
      <p className="mt-4 text-gray-700 text-lg font-lato">{message}</p>
    </div>
  );
};
