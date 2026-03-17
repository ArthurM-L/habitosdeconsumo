import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { groups } from '@/data/quizData';

interface Session {
  id: string;
  created_at: string;
  results: Record<string, number>;
}

export default function AdminResponses() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('quiz_sessions')
      .select('id, created_at, results')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setSessions(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-muted-foreground text-center py-8">Carregando respostas...</p>;

  if (!sessions.length) return <p className="text-muted-foreground text-center py-8">Nenhuma resposta ainda.</p>;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Data</th>
              {groups.map((g) => (
                <th key={g.id} className="text-left px-5 py-3 text-muted-foreground font-medium">
                  <span style={{ color: g.color }}>{g.icon}</span> {g.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sessions.map((s, i) => (
              <tr key={s.id} className={i % 2 === 0 ? 'bg-muted/20' : ''}>
                <td className="px-5 py-3 text-muted-foreground text-xs">
                  {new Date(s.created_at).toLocaleString('pt-BR')}
                </td>
                {groups.map((g) => (
                  <td key={g.id} className="px-5 py-3 font-bold" style={{ color: g.color }}>
                    {s.results?.[g.id] ?? 0}%
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
