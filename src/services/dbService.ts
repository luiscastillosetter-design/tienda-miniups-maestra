import { supabase } from '@/lib/supabase';

export const dbService = {
  async get(key: string) {
    try {
      const { data, error } = await supabase
        .from('store_data')
        .select('value')
        .eq('key', key)
        .maybeSingle();

      if (error) {
        console.error(`[Supabase dbService.get] Error leyendo "${key}":`, error.message);
        return null;
      }

      return data ? data.value : null;
    } catch (err) {
      console.error(`[Supabase dbService.get] Excepción en "${key}":`, err);
      return null;
    }
  },

  async set(key: string, value: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('store_data')
        .upsert(
          { key, value, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );

      if (error) {
        console.error(`[Supabase dbService.set] Error guardando "${key}":`, error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.error(`[Supabase dbService.set] Excepción en "${key}":`, err);
      return false;
    }
  },
};