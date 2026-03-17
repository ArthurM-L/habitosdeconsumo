import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, LogOut } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import AdminQuestions from '@/components/admin/AdminQuestions';
import AdminWeights from '@/components/admin/AdminWeights';
import AdminGroups from '@/components/admin/AdminGroups';
import AdminResponses from '@/components/admin/AdminResponses';

const ADMIN_PASSWORD = 'quiz@admin2024';

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('quiz_admin');
    if (stored === ADMIN_PASSWORD) setAuthed(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('quiz_admin', password);
      setAuthed(true);
      setError('');
    } else {
      setError('Senha incorreta. Tente novamente.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('quiz_admin');
    setAuthed(false);
    setPassword('');
  };

  if (!authed) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
        <motion.div
          className="glass-strong rounded-2xl p-8 w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 rounded-2xl gradient-bg">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-center mb-6">Painel Admin</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              className="py-3 rounded-xl gradient-bg font-display font-bold text-white hover:scale-105 active:scale-95 transition-all"
            >
              Entrar
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold gradient-text">
            Painel Admin
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 glass rounded-xl px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>

        <Tabs defaultValue="questions">
          <TabsList className="glass mb-6 h-auto p-1 gap-1 flex-wrap">
            <TabsTrigger value="questions" className="rounded-xl px-4 py-2 text-sm font-display">
              Perguntas
            </TabsTrigger>
            <TabsTrigger value="weights" className="rounded-xl px-4 py-2 text-sm font-display">
              Pesos
            </TabsTrigger>
            <TabsTrigger value="groups" className="rounded-xl px-4 py-2 text-sm font-display">
              Grupos
            </TabsTrigger>
            <TabsTrigger value="responses" className="rounded-xl px-4 py-2 text-sm font-display">
              Respostas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <AdminQuestions />
          </TabsContent>
          <TabsContent value="weights">
            <AdminWeights />
          </TabsContent>
          <TabsContent value="groups">
            <AdminGroups />
          </TabsContent>
          <TabsContent value="responses">
            <AdminResponses />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
