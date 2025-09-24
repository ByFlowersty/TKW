import { supabase } from './supabaseClient';
import { DocumentData } from '../types';

// NOTE: All instances of 'userId' in .eq() and in object keys for insertion
// have been changed to 'user_id' to match the actual snake_case column name in the database.
// This is a critical fix to align the service with the database schema.

export const uploadFile = async (file: File, userId: string): Promise<{ publicUrl: string }> => {
  const cleanFileName = file.name
    .toLowerCase() // Convert to lowercase
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .replace(/[^a-z0-9._-]+/g, '-') // Replace invalid characters with a hyphen
    .replace(/--+/g, '-') // Collapse consecutive hyphens
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens
    
  const fileName = `${Date.now()}-${cleanFileName || 'document'}`;
  // Store files in a subfolder named after the user's ID
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage.from('documentos').upload(filePath, file);

  if (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file.');
  }

  const { data } = supabase.storage.from('documentos').getPublicUrl(filePath);

  if (!data || !data.publicUrl) {
    throw new Error('Could not get public URL for uploaded file.');
  }

  return { publicUrl: data.publicUrl };
};

export const addDocument = async (
  docData: Omit<DocumentData, 'id' | 'created_at'>
): Promise<DocumentData> => {
  // Map camelCase from app to snake_case for DB
  const documentToInsert = {
    title: docData.title,
    summary: docData.summary,
    keywords: docData.keywords,
    relevance_score: docData.relevanceScore,
    category: docData.category,
    file_url: docData.fileUrl,
    user_id: docData.userId, // Critical fix: use snake_case for the column name
    file_name: docData.fileName, // Add file_name to the database
  };

  const { data, error } = await supabase
    .from('documents')
    .insert([documentToInsert])
    .select()
    .single();

  if (error) {
    console.error('Error adding document:', error.message);
    throw new Error('Failed to add document to the database.');
  }

  // Map response back to camelCase for the app
  return {
    ...docData,
    id: data.id,
    created_at: data.created_at,
  };
};

export const getMyDocuments = async (userId: string): Promise<DocumentData[]> => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId) // Critical fix: use snake_case for query
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    return [];
  }

  // Map snake_case from DB to camelCase for app
  return data.map(doc => ({
      id: doc.id,
      created_at: doc.created_at,
      title: doc.title,
      summary: doc.summary,
      keywords: doc.keywords,
      relevanceScore: doc.relevance_score,
      category: doc.category,
      fileUrl: doc.file_url,
      userId: doc.user_id,
      fileName: doc.file_name || '', // Retrieve file_name from DB
  }));
};

export const getUploadsToday = async (userId: string): Promise<number> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { count, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId) // Critical fix: use snake_case for query
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

    if (error) {
        console.error("Error fetching today's upload count:", error);
        return 0;
    }

    return count || 0;
}

const mapDocumentsWithAuthorEmail = async (docs: any[]): Promise<DocumentData[]> => {
    if (!docs || docs.length === 0) return [];
    
    const userIds = [...new Set(docs.map(doc => doc.user_id).filter(id => id))];
    if (userIds.length === 0) {
        return docs.map(doc => ({
            id: doc.id,
            created_at: doc.created_at,
            title: doc.title,
            summary: doc.summary,
            keywords: doc.keywords,
            relevanceScore: doc.relevance_score,
            category: doc.category,
            fileUrl: doc.file_url,
            userId: doc.user_id,
            fileName: doc.file_name || '',
            authorEmail: 'Autor desconocido',
        }));
    }

    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

    if (profileError) {
        console.error('Error fetching profiles for search results:', profileError);
        // Fallback gracefully
        return docs.map(doc => ({
            id: doc.id,
            created_at: doc.created_at,
            title: doc.title,
            summary: doc.summary,
            keywords: doc.keywords,
            relevanceScore: doc.relevance_score,
            category: doc.category,
            fileUrl: doc.file_url,
            userId: doc.user_id,
            fileName: doc.file_name || '',
            authorEmail: 'Autor desconocido',
        }));
    }
    
    const emailMap = new Map<string, string>();
    profiles.forEach(p => emailMap.set(p.id, p.email));

    return docs.map(doc => ({
        id: doc.id,
        created_at: doc.created_at,
        title: doc.title,
        summary: doc.summary,
        keywords: doc.keywords,
        relevanceScore: doc.relevance_score,
        category: doc.category,
        fileUrl: doc.file_url,
        userId: doc.user_id,
        fileName: doc.file_name || '',
        authorEmail: emailMap.get(doc.user_id) || 'Autor desconocido'
    }));
};

export const getUniqueCategories = async (): Promise<string[]> => {
    const { data, error } = await supabase
        .from('documents')
        .select('category');

    if (error) {
        console.error('Error fetching unique categories:', error);
        return [];
    }
    
    if (!data) {
        return [];
    }

    // FIX: Replaced `flatMap` with a more explicit `map` and `filter` chain to ensure correct type inference.
    // The previous `flatMap` implementation was resulting in `unknown[]`, causing a type error.
    // This approach is more robust and correctly types the result as `string[]`.
    const categories = data
        .map(item => item?.category)
        .filter((category): category is string => typeof category === 'string' && category.length > 0);

    return [...new Set(categories)];
};


export const searchPublicDocumentsByKeywords = async (keywords: string[]): Promise<DocumentData[]> => {
    const query = keywords.join(' | ');
    
    // FIX: Added 'config: spanish' to match the database's full-text search configuration.
    // This was the primary reason the search was failing.
    const { data: docs, error } = await supabase
        .from('documents')
        .select('*')
        .textSearch('fts', query, { 
            type: 'websearch',
            config: 'spanish' 
        });

    if (error) {
        console.error('Error searching documents by keywords:', error);
        throw new Error('La búsqueda por palabras clave falló.');
    }
    
    return mapDocumentsWithAuthorEmail(docs);
};


export const searchPublicDocumentsByAuthorEmail = async (email: string): Promise<DocumentData[]> => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return [];

    // FIX: Changed search to be an exact (but case-insensitive) match for better accuracy.
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', trimmedEmail)
        .single();

    if (profileError || !profile) {
        console.error('Author profile not found:', profileError?.message || `No profile for ${trimmedEmail}`);
        return [];
    }

    const { data: docs, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error searching documents by author:', error);
        throw new Error('La búsqueda por autor falló.');
    }

    // Map the results directly since we already have the email.
    return docs.map((doc: any) => ({
        id: doc.id,
        created_at: doc.created_at,
        title: doc.title,
        summary: doc.summary,
        keywords: doc.keywords,
        relevanceScore: doc.relevance_score,
        category: doc.category,
        fileUrl: doc.file_url,
        userId: doc.user_id,
        fileName: doc.file_name || '',
        authorEmail: trimmedEmail
    }));
};

export const searchPublicDocumentsByCategory = async (category: string): Promise<DocumentData[]> => {
    const { data: docs, error } = await supabase
        .from('documents')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error searching documents by category:', error);
        throw new Error('La búsqueda por categoría falló.');
    }

    return mapDocumentsWithAuthorEmail(docs);
};
