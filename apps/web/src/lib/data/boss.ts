import 'server-only';
import { getSupabase } from './supabase';

export interface Boss {
  id: string;
  name: string;
  description?: string;
  target: number;
  current: number;
  deadline?: string;
  topic?: string;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
  completed_at?: string;
}

export async function getActiveBosses(): Promise<Boss[]> {
  const supabase = getSupabase();
  const { data: settings } = await supabase.from('settings').select('bosses').eq('id', 1).single();
  const all = (settings?.bosses as Boss[]) ?? [];
  return all.filter(b => b.status === 'active');
}

export async function getAllBosses(): Promise<Boss[]> {
  const supabase = getSupabase();
  const { data: settings } = await supabase.from('settings').select('bosses').eq('id', 1).single();
  return (settings?.bosses as Boss[]) ?? [];
}
