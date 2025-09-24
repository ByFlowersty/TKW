import React, { useState, useEffect } from 'react';
// FIX: Changed import for Session and User to '@supabase/auth-js' to resolve module export errors.
// This is a common requirement in some versions of the Supabase client library.
import type { Session, User } from '@supabase/auth-js';
import { Auth } from './components/Auth';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { InputForm } from './components/InputForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { KnowledgeBank } from './components/KnowledgeBank';
import { Loader } from './components/Loader';
import { analyzeDocument } from './services/geminiService';
import { addDocument, getMyDocuments, uploadFile, getUploadsToday } from './services/supabaseService';
// FIX: Imported `IndexingResult` to resolve 'Cannot find name' error.
import { DocumentData, IndexingResult } from './types';
import { ExploreView } from './components/ExploreView';
import { supabase } from './services/supabaseClient';


type View = 'personal' | 'explore';

const UPLOAD_LIMIT_PER_DAY = 5;

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IndexingResult | null>(null);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [uploadCount, setUploadCount] = useState(0);
  const [currentView, setCurrentView] = useState<View>('personal');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      if (currentView === 'personal') {
        fetchDocuments();
      }
      fetchUploadCount();
    } else {
      // Clear data if user logs out
      setDocuments([]);
      setUploadCount(0);
    }
  }, [user, currentView]);

  const fetchDocuments = async () => {
    if (!user) return;
    setIsLoadingDocs(true);
    const userDocuments = await getMyDocuments(user.id);
    setDocuments(userDocuments);
    setIsLoadingDocs(false);
  };

  const fetchUploadCount = async () => {
    if (!user) return;
    const count = await getUploadsToday(user.id);
    setUploadCount(count);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };
  
  const handleSubmit = async (file: File) => {
    if (!user) {
      setError("Debes iniciar sesión para subir archivos.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let analysisResult: IndexingResult;
      const isAudio = file.type.startsWith('audio/');
      const isVideo = file.type.startsWith('video/');

      if (isAudio || isVideo) {
        // Para archivos de audio y video, omitir el análisis de IA y crear datos de marcador de posición
        const fileType = isAudio ? 'Audio' : 'Video';
        analysisResult = {
          title: file.name,
          summary: `Archivo de ${fileType.toLowerCase()}: ${file.name}.`,
          category: fileType,
          // Utiliza el nombre del archivo (sin extensión) como palabra clave predeterminada
          keywords: [file.name.split('.').slice(0, -1).join('.')], 
          relevanceScore: 0,
        };
        // No establecer 'result' para los archivos de audio/video, ya que no hay análisis que mostrar
      } else {
        // Para otros archivos, analizar con la IA
        analysisResult = await analyzeDocument(file);
        setResult(analysisResult);
      }
      
      const { publicUrl } = await uploadFile(file, user.id);
      
      const newDocumentData = {
        ...analysisResult,
        fileUrl: publicUrl,
        userId: user.id,
        fileName: file.name,
      };
      
      await addDocument(newDocumentData);
      
      await fetchDocuments();
      await fetchUploadCount();

    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return <Auth />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'personal':
        return (
          <>
            <InputForm 
              onSubmit={handleSubmit} 
              isLoading={isLoading} 
              uploadCount={uploadCount}
              uploadLimit={UPLOAD_LIMIT_PER_DAY}
            />
            {error && (
                <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}
            {isLoading && !result && <Loader message="Procesando archivo, por favor espera..." />}
            {result && <div className="mt-8"><ResultsDisplay result={result} /></div>}
            <KnowledgeBank documents={documents} isLoading={isLoadingDocs} title="Mi Banco de Conocimiento" />
          </>
        );
      case 'explore':
        return <ExploreView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f1ea]">
      <Header 
        user={user} 
        onSignOut={handleSignOut} 
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
      <main className="container mx-auto px-4 py-8 flex-grow w-full max-w-6xl">
        {renderCurrentView()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
