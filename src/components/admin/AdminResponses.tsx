import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { groups } from '@/data/quizData';

interface Session {
  id: string;
  created_at: string;
  results: Record<string, number>;
  user_name?: string | null;
  user_gender?: string | null;
  user_birthdate?: string | null;
}

export default function AdminResponses() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('quiz_sessions')
      .select('id, created_at, results, user_name, user_gender, user_birthdate')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setSessions(data as unknown as Session[]);
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
              <th className="text-left px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">Data</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">Nome</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">Gênero</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">Nascimento</th>
              {groups.map((g) => (
                <th key={g.id} className="text-left px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">
                  <span style={{ color: g.color }}>{g.icon}</span> {g.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sessions.map((s, i) => (
              <tr key={s.id} className={i % 2 === 0 ? 'bg-muted/20' : ''}>
                <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                  {new Date(s.created_at).toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                  {s.user_name ?? <span className="text-muted-foreground/40">—</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap capitalize">
                  {s.user_gender ?? <span className="opacity-40">—</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {s.user_birthdate
                    ? new Date(s.user_birthdate + 'T00:00:00').toLocaleDateString('pt-BR')
                    : <span className="opacity-40">—</span>}
                </td>
                {groups.map((g) => (
                  <td key={g.id} className="px-4 py-3 font-bold whitespace-nowrap" style={{ color: g.color }}>
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
