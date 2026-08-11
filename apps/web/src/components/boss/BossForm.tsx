'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pickConstellationForBoss, getConstellationById } from '@starcatcher/shared';
import { playConstellationSound, type SoundMode } from '@/lib/audio/controller';
import { toast } from '@/components/toast/Toaster';
import { DeadlinePicker } from './DeadlinePicker';
import { ConstellationPicker } from './ConstellationPicker';

const TOPICS = [
  { value: '',        label: '不限主题', color: '#A8B0C8' },
  { value: 'AI',      label: 'AI 应用',  color: '#5FE0C7' },
  { value: 'one-person', label: '一人公司', color: '#E8B86F' },
  { value: 'self-mgmt',  label: '自我管理', color: '#B8A4D4' }
];

interface Boss {
  id: string;
  name: string;
  description?: string;
  target: number;
  current: number;
  deadline?: string;
  topic?: 'AI' | 'one-person' | 'self-mgmt' | '';
  status: 'active' | 'completed' | 'abandoned';
  const_id?: string;
  const_tier?: 1 | 2 | 3;
}

export function BossForm({
  existing,
  usedConstellationIds = [],
  onClose
}: {
  existing?: Boss;
  usedConstellationIds?: string[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [target, setTarget] = useState(existing?.target ?? 30);
  const [deadline, setDeadline] = useState<string | undefined>(existing?.deadline?.slice(0, 10) || undefined);
  const [topic, setTopic] = useState(existing?.topic ?? '');
  const [saving, setSaving] = useState(false);

  // 星座分配：编辑模式保留 existing；创建模式按 target 自动挑
  const [constId, setConstId] = useState<string | undefined>(existing?.const_id);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());

  // 创建模式初次 mount：基于 target 挑一个
  useEffect(() => {
    if (existing) return;
    const picked = pickConstellationForBoss(target, usedConstellationIds);
    if (picked) setConstId(picked.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 创建模式下，target 变化时重新挑（除非用户已经手动 swap 过）
  useEffect(() => {
    if (existing) return;
    if (skipped.size > 0) return; // 用户换过，别覆盖
    const picked = pickConstellationForBoss(target, usedConstellationIds);
    if (picked) setConstId(picked.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  function swap() {
    if (!constId) return;
    const next = pickConstellationForBoss(target, [
      ...usedConstellationIds,
      constId,
      ...Array.from(skipped)
    ]);
    if (next) {
      setSkipped(prev => new Set([...prev, constId]));
      setConstId(next.id);
    } else {
      toast('当前 tier 和相邻 tier 都没可换的了', { tone: 'info' });
    }
  }

  async function save() {
    if (!name.trim()) { toast('给星座起个名字', { tone: 'warning' }); return; }
    if (target < 1) { toast('目标数至少 1', { tone: 'warning' }); return; }
    setSaving(true);
    const pickedConst = constId ? getConstTier(constId) : undefined;
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      target: parseInt(String(target)),
      deadline: deadline || undefined,
      topic: topic || undefined,
      const_id: constId,
      const_tier: pickedConst
    };
    const url = existing ? `/api/bosses/${existing.id}` : '/api/bosses';
    const method = existing ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setSaving(false);
    if (res.ok) {
      onClose();
      router.refresh();
    } else {
      toast('保存失败：' + (await res.text()), { tone: 'warning' });
    }
  }

  async function del() {
    if (!existing) return;
    if (!confirm(`确定删除 Boss「${existing.name}」？`)) return;
    const res = await fetch(`/api/bosses/${existing.id}`, { method: 'DELETE' });
    if (res.ok) {
      onClose();
      router.refresh();
    } else {
      toast('删除失败', { tone: 'warning' });
    }
  }

  return (
    <div className="hand-drawn-border rounded-card bg-ink-800 p-6 shadow-glow">
      <h3 className="font-display text-xl text-bone-50">
        {existing ? '编辑星座' : '创建新星座'}
      </h3>
      <p className="mt-1 text-xs text-bone-400">
        每个 <b className="text-celestial">Publish</b> 自动点亮一星。绑了主题后只点亮该主题的 item；不绑则不限。例：「公众号连载 50 篇」不限；「100 个 AI 作品」只算 AI item 的 Publish。
      </p>

      <div className="mt-5 space-y-5">
        <Field label="名字">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例：公众号连载 50 篇"
            className="w-full rounded border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-bone-50 placeholder:text-bone-400 focus:border-gold/50 focus:outline-none"
          />
        </Field>

        <Field label="说明（选填）">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="给自己的一句话提醒"
            rows={2}
            className="w-full rounded border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-bone-50 placeholder:text-bone-400 focus:border-gold/50 focus:outline-none"
          />
        </Field>

        <Field label="目标数（Publish 次数）">
          <input
            type="number"
            value={target}
            onChange={e => setTarget(parseInt(e.target.value) || 0)}
            min={1}
            className="num w-full rounded border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-bone-50 focus:border-gold/50 focus:outline-none"
          />
        </Field>

        {constId && (
          <Field label="星座模板（自动配，可换）">
            <ConstellationPicker
              constId={constId}
              target={target}
              current={existing?.current ?? 0}
              onSwap={swap}
            />
          </Field>
        )}

        <DeadlinePicker value={deadline} onChange={setDeadline} />

        <Field label="绑定主题（选填）">
          <div className="flex flex-wrap gap-2">
            {TOPICS.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTopic(t.value as any)}
                className={`rounded-button border px-3 py-1 text-xs transition-all
                  ${topic === t.value
                    ? 'border-gold bg-gold/10 text-gold shadow-glow'
                    : 'border-ink-700 text-bone-200 hover:border-ink-600'}`}
                style={topic === t.value ? { borderColor: t.color, color: t.color, background: `${t.color}10` } : {}}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div>
          {existing && (
            <button
              type="button"
              onClick={del}
              className="text-xs text-warning hover:text-warning/70"
            >
              删除这个星座
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-button border border-ink-700 px-4 py-2 text-sm text-bone-200 hover:border-ink-600"
          >
            取消
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-button border border-gold bg-gold/10 px-4 py-2 text-sm text-gold hover:bg-gold/20 disabled:opacity-50"
          >
            {saving ? '保存中…' : existing ? '保存修改' : '创建星座'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="num text-caption text-bone-400">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

// 取 constId 对应的 tier
function getConstTier(id: string): 1 | 2 | 3 | undefined {
  return getConstellationById(id)?.tier;
}
