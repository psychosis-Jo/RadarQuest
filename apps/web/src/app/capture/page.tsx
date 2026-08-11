import { AppShell } from '@/components/layout/AppShell';
import { getCaptureItems, getKeptItems } from '@/lib/data/items';
import { getItemActionMap } from '@/lib/data/actions';
import { CaptureView } from './CaptureView';

// Supabase 数据按请求拉，不要静态化
export const dynamic = 'force-dynamic';

export default async function CapturePage() {
  const [unprocessed, kept] = await Promise.all([
    getCaptureItems(200, 14),
    getKeptItems(60, 14)
  ]);

  // 一次性拿所有相关 item 的动作状态
  const allIds = [...unprocessed, ...kept].map(i => i.id);
  const actions = await getItemActionMap(allIds);

  return (
    <AppShell activeTab="capture">
      <CaptureView
        initialUnprocessed={unprocessed}
        initialKept={kept}
        initialActions={actions}
      />
    </AppShell>
  );
}
