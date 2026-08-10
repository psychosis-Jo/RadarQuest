'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DeadlinePicker } from './DeadlinePicker';

const TOPICS = [
  { value: '',        label: '不绑定',  color: '#A8B0C8' },
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
}

export function BossForm({ existing, onClose }: { existing?: Boss; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [target, setTarget] = useState(existing?.target ?? 30);
  const [deadline, setDeadline] = useState(existing?.deadline?.slice(0, 10) ?? '');
  const [topic, setTopic] = useState(existing?.topic ?? '');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) { alert('给 Boss 起个名字'); return; }
    if (target < 1) { alert('目标数至少 1'); return; }
    setSaving(true);
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      target: parseInt(String(target)),
      deadline: deadline || undefined,
      topic: topic || undefined
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
      alert('保存失败：' + (await res.text()));
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
      alert('删除失败');
    }
  }

  return (
    <div className="hand-drawn-border rounded bg-ink-800 p-6 shadow-glow">
      <h3 className="font-display text-xl text-bone-50">
        {existing ? '编辑 Boss' : '创建新 Boss'}
      </h3>
      <p className="mt-1 text-xs text-bone-400">
        每个 Publish 自动 +1 击破。比如"公众号连载 50 篇"或"100 个 AI 作品"
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

        <DeadlinePicker value={deadline} onChange={setDeadline} />

        <Field label="绑定主题（选填）">
          <div className="flex flex-wrap gap-2">
            {TOPICS.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTopic(t.value as any)}
                className={`rounded border px-3 py-1 text-xs transition-all
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
              删除这个 Boss
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-ink-700 px-4 py-2 text-sm text-bone-200 hover:border-ink-600"
          >
            取消
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded border border-gold bg-gold/10 px-4 py-2 text-sm text-gold hover:bg-gold/20 disabled:opacity-50"
          >
            {saving ? '保存中…' : existing ? '保存修改' : '创建 Boss'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="num text-[10px] uppercase tracking-widest text-bone-400">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
