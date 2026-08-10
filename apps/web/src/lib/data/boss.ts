import 'server-only';
import { getSupabase } from './supabase';

export interface Boss {
  id: string;
  name: string;
  description?: string;
  target: number;
  current: number;
  deadline?: string;
  topic?: 'AI' | 'one-person' | 'self-mgmt' | '';
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
  completed_at?: string;
}

async function getBossesFromSettings(): Promise<Boss[]> {
  const supabase = getSupabase();
  const { data } = await supabase.from('settings').select('bosses').eq('id', 1).single();
  return (data?.bosses as Boss[]) ?? [];
}

async function saveBossesToSettings(bosses: Boss[]) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('settings')
    .update({ bosses, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) throw new Error(error.message);
}

export async function getActiveBosses(): Promise<Boss[]> {
  const all = await getBossesFromSettings();
  return all.filter(b => b.status === 'active');
}

export async function getAllBosses(): Promise<Boss[]> {
  return getBossesFromSettings();
}

export async function createBoss(input: Omit<Boss, 'id' | 'current' | 'status' | 'created_at' | 'completed_at'>): Promise<Boss> {
  const all = await getBossesFromSettings();
  const boss: Boss = {
    ...input,
    id: `boss_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    current: 0,
    status: 'active',
    created_at: new Date().toISOString()
  };
  await saveBossesToSettings([...all, boss]);
  return boss;
}

export async function updateBoss(id: string, patch: Partial<Boss>): Promise<Boss> {
  const all = await getBossesFromSettings();
  const idx = all.findIndex(b => b.id === id);
  if (idx === -1) throw new Error('Boss not found');
  const updated = { ...all[idx], ...patch };
  // 自动判断 status
  if (updated.current >= updated.target && updated.status === 'active') {
    updated.status = 'completed';
    updated.completed_at = updated.completed_at ?? new Date().toISOString();
  }
  all[idx] = updated;
  await saveBossesToSettings(all);
  return updated;
}

export async function deleteBoss(id: string): Promise<void> {
  const all = await getBossesFromSettings();
  await saveBossesToSettings(all.filter(b => b.id !== id));
}
