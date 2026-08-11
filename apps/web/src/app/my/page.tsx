import { AppShell } from '@/components/layout/AppShell';
import { getUserStats } from '@/lib/data/stats';
import { getActiveBosses } from '@/lib/data/boss';
import { getSkillProgress } from '@/lib/data/skill';
import { MyOverview } from './MyOverview';

export const dynamic = 'force-dynamic';

export default async function MyPage() {
  const [stats, bosses, skills] = await Promise.all([
    getUserStats(),
    getActiveBosses(),
    getSkillProgress()
  ]);
  const skillCounts = {
    AI: skills.AI.count,
    'one-person': skills['one-person'].count,
    'self-mgmt': skills['self-mgmt'].count
  };

  return (
    <AppShell activeTab="my">
      <MyOverview stats={stats} activeBosses={bosses} skillCounts={skillCounts} />
    </AppShell>
  );
}
