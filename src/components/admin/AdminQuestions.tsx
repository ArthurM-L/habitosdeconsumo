import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { groups } from '@/data/quizData';

interface Question {
  id: number;
  text: string;
  weights: Record<string, number>;
  order_index: number;
}

export default function AdminQuestions() {
  const [qs, setQs] = useState<Question[]>([]);
  const [editText, setEditText] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});

  useEffect(() => {
    supabase
      .from('questions')
      .select('*')
      .order('order_index')
      .then(({ data }) => {
        if (data) {
          setQs(data);
          const texts: Record<number, string> = {};
          data.forEach((q: Question) => { texts[q.id] = q.text; });
          setEditText(texts);
        }
      });
  }, []);

  const handleSave = async (id: number) => {
    setSaving((s) => ({ ...s, [id]: true }));
    await supabase.from('questions').update({ text: editText[id] }).eq('id', id);
    setSaving((s) => ({ ...s, [id]: false }));
    setSaved((s) => ({ ...s, [id]: true }));
    setTimeout(() => setSaved((s) => ({ ...s, [id]: false })), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      {qs.map((q) => (
        <div key={q.id} className="glass rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span className="mt-1 flex-shrink-0 w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-xs font-bold text-white font-display">
              {q.order_index ?? q.id}
            </span>
            <div className="flex-1 flex flex-col gap-3">
              <textarea
                value={editText[q.id] ?? q.text}
                onChange={(e) => setEditText((t) => ({ ...t, [q.id]: e.target.value }))}
                rows={2}
                className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => handleSave(q.id)}
                  disabled={saving[q.id]}
                  className="px-5 py-2 rounded-xl gradient-bg text-white text-sm font-display font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {saved[q.id] ? '✓ Salvo!' : saving[q.id] ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      {qs.length === 0 && (
        <p className="text-muted-foreground text-center py-8">Carregando perguntas...</p>
      )}
    </div>
  );
}
