import { createClient } from '@supabase/supabase-js';

// FIX: Removed '/// <reference types="vite/client" />' as it was causing an error.
// FIX: Used type assertion to bypass TypeScript errors with import.meta.env
// because project configuration seems to be missing Vite client types.
const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('La URL y la clave anónima de Supabase no están configuradas. Por favor, añádelas al archivo .env');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
