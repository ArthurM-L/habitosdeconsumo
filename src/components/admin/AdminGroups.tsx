import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Plus } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
}

export default function AdminGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [newGroup, setNewGroup] = useState<Partial<Group>>({ id: '', name: '', color: '#B4FF00', icon: '🌟', description: '' });
  const [adding, setAdding] = useState(false);

  const fetchGroups = async () => {
    const { data } = await supabase.from('groups').select('*');
    if (data) setGroups(data);
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleUpdate = async (g: Group) => {
    setSaving((s) => ({ ...s, [g.id]: true }));
    await supabase.from('groups').update({ name: g.name, color: g.color, icon: g.icon, description: g.description }).eq('id', g.id);
    setSaving((s) => ({ ...s, [g.id]: false }));
    setSaved((s) => ({ ...s, [g.id]: true }));
    setTimeout(() => setSaved((s) => ({ ...s, [g.id]: false })), 2000);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('groups').delete().eq('id', id);
    fetchGroups();
  };

  const handleAdd = async () => {
    if (!newGroup.id || !newGroup.name) return;
    setAdding(true);
    await supabase.from('groups').insert(newGroup as { id: string; name: string; color: string; icon: string; description: string });
    setNewGroup({ id: '', name: '', color: '#B4FF00', icon: '🌟', description: '' });
    setAdding(false);
    fetchGroups();
  };

  const updateLocal = (id: string, field: keyof Group, value: string) => {
    setGroups((gs) => gs.map((g) => g.id === id ? { ...g, [field]: value } : g));
  };

  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <div key={g.id} className="glass rounded-2xl p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
              <input value={g.name} onChange={(e) => updateLocal(g.id, 'name', e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ícone</label>
              <input value={g.icon} onChange={(e) => updateLocal(g.id, 'icon', e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Cor</label>
              <div className="flex gap-2">
                <input type="color" value={g.color} onChange={(e) => updateLocal(g.id, 'color', e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                <input value={g.color} onChange={(e) => updateLocal(g.id, 'color', e.target.value)} className="flex-1 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Descrição</label>
              <textarea value={g.description} onChange={(e) => updateLocal(g.id, 'description', e.target.value)} rows={2} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={() => handleDelete(g.id)} className="flex items-center gap-1 text-destructive text-sm hover:opacity-80 transition-opacity">
              <Trash2 className="w-4 h-4" />
              Remover
            </button>
            <button onClick={() => handleUpdate(g)} disabled={saving[g.id]} className="px-5 py-2 rounded-xl gradient-bg text-white text-sm font-display font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
              {saved[g.id] ? '✓ Salvo!' : saving[g.id] ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      ))}

      {/* Add new group */}
      <div className="glass rounded-2xl p-5 border-2 border-dashed border-border">
        <h3 className="font-display font-bold text-sm mb-4 text-muted-foreground">Adicionar novo grupo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">ID (ex: grupoD)</label>
            <input value={newGroup.id} onChange={(e) => setNewGroup((n) => ({ ...n, id: e.target.value }))} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="grupoD" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
            <input value={newGroup.name} onChange={(e) => setNewGroup((n) => ({ ...n, name: e.target.value }))} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Nome do grupo" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Ícone</label>
            <input value={newGroup.icon} onChange={(e) => setNewGroup((n) => ({ ...n, icon: e.target.value }))} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="🌟" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Cor</label>
            <input value={newGroup.color} onChange={(e) => setNewGroup((n) => ({ ...n, color: e.target.value }))} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="#B4FF00" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">Descrição</label>
            <textarea value={newGroup.description} onChange={(e) => setNewGroup((n) => ({ ...n, description: e.target.value }))} rows={2} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Descrição do perfil..." />
          </div>
        </div>
        <button onClick={handleAdd} disabled={adding} className="flex items-center gap-2 px-5 py-2 rounded-xl gradient-bg text-white text-sm font-display font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
          <Plus className="w-4 h-4" />
          {adding ? 'Adicionando...' : 'Adicionar Grupo'}
        </button>
      </div>
    </div>
  );
}
