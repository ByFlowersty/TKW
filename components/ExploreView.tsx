import React, { useState, useEffect } from 'react';
import { DocumentData } from '../types';
import { getKeywordsForTopic } from '../services/geminiService';
import { 
    searchPublicDocumentsByAuthorEmail, 
    searchPublicDocumentsByKeywords,
    getUniqueCategories,
    searchPublicDocumentsByCategory
} from '../services/supabaseService';
import { DocumentCard } from './DocumentCard';
import { Loader } from './Loader';
import { DocumentPreview } from './DocumentPreview';

type SearchType = 'topic' | 'author';

export const ExploreView: React.FC = () => {
    const [searchType, setSearchType] = useState<SearchType>('topic');
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<DocumentData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<DocumentData | null>(null);
    
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            const uniqueCategories = await getUniqueCategories();
            setCategories(uniqueCategories);
            setIsLoadingCategories(false);
        };
        fetchCategories();
    }, []);

    const executeSearch = async (searchFn: () => Promise<DocumentData[]>) => {
        setIsLoading(true);
        setError(null);
        setSearched(true);
        setResults([]);
        setSelectedCategory(null); // Reset category selection on new search

        try {
            const foundDocuments = await searchFn();
            setResults(foundDocuments);
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error durante la búsqueda.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        
        if (searchType === 'topic') {
            executeSearch(async () => {
                // 1. Get AI-generated keywords for semantic search
                const aiKeywords = await getKeywordsForTopic(searchTerm);
                
                // 2. Get user's literal search terms for direct matches
                const userKeywords = searchTerm.split(/\s+/).filter(word => word.length > 2);

                // 3. Combine both lists and remove duplicates for a comprehensive search
                const combinedKeywords = [...new Set([...aiKeywords, ...userKeywords])];

                return searchPublicDocumentsByKeywords(combinedKeywords);
            });
        } else { // author
            executeSearch(() => searchPublicDocumentsByAuthorEmail(searchTerm));
        }
    };

    const handleCategorySelect = (category: string | null) => {
        if (category) {
            setSelectedCategory(category);
            setSearchTerm(''); // Clear search term
            executeSearch(() => searchPublicDocumentsByCategory(category));
        } else {
            setSelectedCategory(null);
            setResults([]);
            setSearched(false);
        }
    };

    return (
        <div className="bg-[#fdfbf7] p-6 border border-gray-300">
            <h3 className="text-3xl font-semibold text-[#333] mb-4">Explorar Conocimiento</h3>
            <p className="text-gray-600 font-lato mb-6">Busca en el archivo público. Descubre documentos por tema con búsqueda semántica o encuentra las contribuciones de un autor específico.</p>
            
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-6">
                <div className="flex">
                    <button 
                        type="button"
                        onClick={() => setSearchType('topic')}
                        className={`px-4 py-2 font-lato font-semibold border border-gray-300 transition-colors ${searchType === 'topic' ? 'bg-archive-teal text-white border-archive-teal' : 'bg-white text-gray-700'}`}
                    >
                        Tema
                    </button>
                    <button
                        type="button"
                        onClick={() => setSearchType('author')}
                        className={`px-4 py-2 font-lato font-semibold border-y border-r border-gray-300 transition-colors ${searchType === 'author' ? 'bg-archive-teal text-white border-archive-teal' : 'bg-white text-gray-700'}`}
                    >
                        Autor
                    </button>
                </div>
                <input
                    type={searchType === 'topic' ? 'text' : 'email'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchType === 'topic' ? 'Ej: "Impacto de la IA en la economía"' : 'Ej: "autor@ejemplo.com"'}
                    className="flex-grow px-4 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-archive-teal font-lato"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-archive-teal text-white font-bold py-2 px-6 hover:bg-archive-teal-dark disabled:bg-gray-400 transition-colors"
                >
                    Buscar
                </button>
            </form>

            <div className="mb-8 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-700 font-lato mb-3">O explora por categoría:</h4>
                {isLoadingCategories ? <p className="text-gray-500 font-lato">Cargando categorías...</p> : (
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => handleCategorySelect(null)}
                            className={`px-3 py-1 text-sm font-lato border transition-colors ${!selectedCategory ? 'bg-archive-teal text-white border-archive-teal' : 'bg-white text-gray-600 border-gray-300 hover:border-archive-teal'}`}
                        >
                            Todas las Categorías
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleCategorySelect(cat)}
                                className={`px-3 py-1 text-sm font-lato border transition-colors ${selectedCategory === cat ? 'bg-archive-teal text-white border-archive-teal' : 'bg-white text-gray-600 border-gray-300 hover:border-archive-teal'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {isLoading && <Loader message="Buscando en el archivo..." />}
            {error && <p className="text-center text-red-600 font-lato">{error}</p>}
            
            {!isLoading && searched && results.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-gray-700 font-lato">No se encontraron documentos que coincidan con su búsqueda o categoría.</p>
                </div>
            )}

            {results.length > 0 && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {results.map((doc) => (
                        <DocumentCard key={doc.id} document={doc} onSelect={setSelectedDocument} />
                    ))}
                </div>
            )}
            
            {selectedDocument && (
                <DocumentPreview document={selectedDocument} onClose={() => setSelectedDocument(null)} />
            )}
        </div>
    );
};