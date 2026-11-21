import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Cliente EXCLUSIVO del servidor. Nunca importar desde componentes 'use client'.
// Usa la service_role key (bypassa RLS). Mientras no esté configurada en el entorno,
// cae temporalmente a la anon key para no tumbar la tienda.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const usingServiceRole = !!serviceKey;

if (!supabaseUrl || (!serviceKey && !anonKey)) {
  console.warn('[supabaseServer] Faltan variables de entorno de Supabase');
} else if (!serviceKey) {
  console.warn('[supabaseServer] SUPABASE_SERVICE_ROLE_KEY no configurada: usando anon key como respaldo temporal (RLS no puede activarse aún)');
}

export const supabaseServer = createClient(supabaseUrl, serviceKey || anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
