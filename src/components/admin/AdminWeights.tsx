import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { groups as seedGroups } from '@/data/quizData';

interface Question {
  id: number;
  text: string;
  weights: Record<string, number>;
  order_index: number;
}

interface Group {
  id: string;
  name: string;
  color: string;
}

export default function AdminWeights() {
  const [qs, setQs] = useState<Question[]>([]);
  const [dbGroups, setDbGroups] = useState<Group[]>([]);
  const [weights, setWeights] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});

  useEffect(() => {
    Promise.all([
      supabase.from('questions').select('*').order('order_index'),
      supabase.from('groups').select('id, name, color'),
    ]).then(([qRes, gRes]) => {
      if (qRes.data) {
        const typedQs = qRes.data as unknown as Question[];
        setQs(typedQs);
        const w: Record<string, Record<string, string>> = {};
        qRes.data.forEach((q: Question) => {
          w[q.id] = {};
          (gRes.data ?? seedGroups).forEach((g: { id: string }) => {
            w[q.id][g.id] = String(q.weights?.[g.id] ?? 0.5);
          });
        });
        setWeights(w);
      }
      if (gRes.data) setDbGroups(gRes.data);
    });
  }, []);

  const groupList = dbGroups.length > 0 ? dbGroups : seedGroups.map((g) => ({ id: g.id, name: g.name, color: g.color }));

  const handleSave = async (qId: number) => {
    setSaving((s) => ({ ...s, [qId]: true }));
    const newWeights: Record<string, number> = {};
    groupList.forEach((g) => {
      newWeights[g.id] = parseFloat(weights[qId]?.[g.id] ?? '0.5');
    });
    await supabase.from('questions').update({ weights: newWeights }).eq('id', qId);
    setSaving((s) => ({ ...s, [qId]: false }));
    setSaved((s) => ({ ...s, [qId]: true }));
    setTimeout(() => setSaved((s) => ({ ...s, [qId]: false })), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      {qs.map((q) => (
        <div key={q.id} className="glass rounded-2xl p-5">
          <p className="text-sm font-display font-bold mb-4 text-foreground">{q.text}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {groupList.map((g) => (
              <div key={g.id} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">
                  <span className="mr-1" style={{ color: g.color }}>●</span>
                  {g.name}
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={weights[q.id]?.[g.id] ?? '0.5'}
                  onChange={(e) =>
                    setWeights((w) => ({
                      ...w,
                      [q.id]: { ...w[q.id], [g.id]: e.target.value },
                    }))
                  }
                  className="rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => handleSave(q.id)}
              disabled={saving[q.id]}
              className="px-5 py-2 rounded-xl gradient-bg text-white text-sm font-display font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {saved[q.id] ? '✓ Salvo!' : saving[q.id] ? 'Salvando...' : 'Salvar Pesos'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
