import React from 'react';
import { IndexingResult } from '../types';
import { ScoreGauge } from './ScoreGauge.tsx';

interface ResultsDisplayProps {
  result: IndexingResult;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  return (
    <div className="bg-[#fdfbf7] p-6 border border-gray-300 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <p className="text-sm text-gray-600 mb-1 font-lato">Categoría: <span className="font-semibold text-archive-teal">{result.category}</span></p>
          <h4 className="text-3xl font-semibold text-gray-800 font-garamond">{result.title}</h4>
          <p className="text-gray-700 mt-4 text-lg leading-relaxed">{result.summary}</p>
          <div className="mt-5">
            <h5 className="font-semibold text-gray-700 font-lato">Palabras Clave:</h5>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 font-lato">
              {result.keywords.map((keyword, index) => (
                <span key={index} className="text-sm text-archive-teal">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-start pt-8">
            <h5 className="font-semibold text-gray-700 mb-2 font-lato text-center">Puntuación de Relevancia</h5>
            <ScoreGauge score={result.relevanceScore} />
        </div>
      </div>
    </div>
  );
};