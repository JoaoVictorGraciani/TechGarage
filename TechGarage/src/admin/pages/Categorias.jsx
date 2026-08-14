import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import { ErrorBox, LoadingAdmin, SuccessBox } from '../components/AdminFeedback';

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState('');
  const [editId, setEditId] = useState(null);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregar() {
    try { setLoading(true); setErro(''); const [c,p] = await Promise.all([api.get('/categories'), api.get('/products')]); setCategorias(c.data); setProdutos(p.data); }
    catch (error) { setErro(error.response?.data?.message || 'Não foi possível carregar as categorias.'); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    let ativo = true;
    async function carregarInicial() {
      try {
        const [c, p] = await Promise.all([api.get('/categories'), api.get('/products')]);
        if (ativo) { setCategorias(c.data); setProdutos(p.data); }
      } catch (error) {
        if (ativo) setErro(error.response?.data?.message || 'Não foi possível carregar as categorias.');
      } finally {
        if (ativo) setLoading(false);
      }
    }
    carregarInicial();
    return () => { ativo = false; };
  }, []);

  const filtradas = useMemo(() => categorias.filter((c) => c.name.toLowerCase().includes(busca.toLowerCase())), [categorias,busca]);
  const count = (id) => produtos.filter((p) => p.categoryId === id).length;

  async function salvar(e) {
    e.preventDefault(); if (!nome.trim()) return;
    try { setErro(''); setSucesso(''); if (editId) await api.put(`/categories/${editId}`, { name: nome.trim() }); else await api.post('/categories', { name: nome.trim() }); setSucesso(editId ? 'Categoria atualizada.' : 'Categoria criada.'); setNome(''); setEditId(null); await carregar(); }
    catch (error) { setErro(error.response?.data?.message || 'Não foi possível salvar a categoria.'); }
  }
  async function excluir(c) {
    if (!window.confirm(`Excluir a categoria "${c.name}"?`)) return;
    try { setErro(''); await api.delete(`/categories/${c.id}`); setCategorias((old) => old.filter((x) => x.id !== c.id)); }
    catch (error) { setErro(error.response?.data?.message || 'Não foi possível excluir. Remova ou mova os produtos dessa categoria primeiro.'); }
  }

  if (loading) return <LoadingAdmin text="Carregando categorias..."/>;

  return <div><div className="mb-6"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">Organização</p><h1 className="mt-1 text-3xl font-bold">Categorias</h1><p className="mt-1 text-sm text-[var(--color-text-secondary)]">Organize o catálogo sem dados de demonstração.</p></div><ErrorBox message={erro}/><SuccessBox message={sucesso}/>
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <form onSubmit={salvar} className="h-fit rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"><h2 className="font-semibold">{editId ? 'Editar categoria' : 'Nova categoria'}</h2><input className="admin-input mt-4" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da categoria"/><div className="mt-3 flex gap-2"><button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-contrast)]"><Plus size={16}/>{editId ? 'Salvar alteração' : 'Adicionar'}</button>{editId && <button type="button" onClick={() => {setEditId(null);setNome('');}} className="rounded-lg border border-[var(--color-border)] p-2"><X size={18}/></button>}</div></form>
      <div><input className="admin-input mb-4 max-w-md" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar categoria..."/><div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"><table className="w-full text-sm"><thead className="bg-[var(--color-surface-hover)] text-left text-xs uppercase text-[var(--color-text-muted)]"><tr><th className="px-4 py-3">Categoria</th><th>Produtos</th><th className="px-4 text-right">Ações</th></tr></thead><tbody>{filtradas.map((c) => <tr key={c.id} className="border-t border-[var(--color-border)]"><td className="px-4 py-3"><p className="font-medium">{c.name}</p><p className="text-xs text-[var(--color-text-muted)]">ID #{c.id}</p></td><td>{count(c.id)}</td><td className="px-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => {setEditId(c.id);setNome(c.name);}} className="rounded-lg border border-[var(--color-border)] p-2 hover:text-[var(--color-accent)]"><Pencil size={15}/></button><button type="button" onClick={() => excluir(c)} className="rounded-lg border border-[var(--color-border)] p-2 hover:text-[var(--color-danger)]"><Trash2 size={15}/></button></div></td></tr>)}</tbody></table>{!filtradas.length && <p className="p-8 text-center text-sm text-[var(--color-text-muted)]">Nenhuma categoria encontrada.</p>}</div></div>
    </div></div>;
}
export default Categorias;
