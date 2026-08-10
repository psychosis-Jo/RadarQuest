import { AppShell } from '@/components/layout/AppShell';
import { SettingsForm } from './SettingsForm';
import { getSupabase } from '@/lib/data/supabase';

async function getSettings() {
  const supabase = getSupabase();
  const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
  return data;
}

export default async function SettingsPage() {
  const settings = await getSettings();
  // 从 settings.keywords（已经在数据库里）读，不 import JSON
  return (
    <AppShell activeTab="" showSidebar={false}>
      <header className="mb-6">
        <h1 className="font-display text-3xl text-bone-50">设置</h1>
        <p className="mt-1 text-sm text-bone-400">强度档位 · 关键词 · 信源</p>
      </header>
      <SettingsForm initial={settings} />
    </AppShell>
  );
}
