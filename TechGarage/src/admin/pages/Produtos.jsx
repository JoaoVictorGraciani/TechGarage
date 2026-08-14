import { useEffect, useMemo, useState } from 'react';
import { Download, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ErrorBox, LoadingAdmin } from '../components/AdminFeedback';
import Pagination from '../components/Pagination';

const LIMITE_BAIXO = 5;
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function isPlaceholderImage(image) {
  return !image || String(image).includes('placehold.co');
}

function stockStatus(stock) {
  if (stock === 0) return ['Sem estoque', 'text-[var(--color-danger)] bg-[var(--color-danger)]/10'];
  if (stock <= LIMITE_BAIXO) return ['Baixo', 'text-[var(--color-warning)] bg-[var(--color-warning)]/10'];
  return ['Normal', 'text-[var(--color-success)] bg-[var(--color-success)]/10'];
}

function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [status, setStatus] = useState('todos');
  const [page, setPage] = useState(1);


  useEffect(() => {
    let ativo = true;
    async function carregarInicial() {
      try {
        const [p, c] = await Promise.all([api.get('/products'), api.get('/categories')]);
        if (ativo) { setProdutos(p.data); setCategorias(c.data); }
      } catch (error) {
        if (ativo) setErro(error.response?.data?.message || 'Não foi possível carregar os produtos.');
      } finally {
        if (ativo) setLoading(false);
      }
    }
    carregarInicial();
    return () => { ativo = false; };
  }, []);

  const filtrados = useMemo(() => produtos.filter((p) => {
    const nome = `${p.name} ${p.brand || ''}`.toLowerCase().includes(busca.toLowerCase());
    const cat = categoria === 'todas' || p.categoryId === Number(categoria);
    const [stockLabel] = stockStatus(Number(p.stock));
    const st = status === 'todos' || stockLabel === status;
    return nome && cat && st;
  }), [produtos, busca, categoria, status]);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtrados.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const exibidos = filtrados.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  async function excluir(id) {
    if (!window.confirm('Excluir este produto permanentemente?')) return;
    try {
      setErro('');
      await api.delete(`/products/${id}`);
      setProdutos((old) => old.filter((p) => p.id !== id));
    } catch (error) {
      setErro(error.response?.data?.message || 'Não foi possível excluir o produto. Ele pode estar vinculado a pedidos.');
    }
  }

  function exportar() {
    const rows = [['ID','Produto','Categoria','Estoque','Status','Preço'], ...filtrados.map((p) => [p.id,p.name,p.category?.name || '-',p.stock,stockStatus(Number(p.stock))[0],Number(p.price).toFixed(2)])];
    const csv = '\ufeff' + rows.map((r) => r.map((v) => `"${String(v).replaceAll('"','""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'techgarage-produtos.csv'; a.click(); URL.revokeObjectURL(url);
  }

  if (loading) return <LoadingAdmin text="Carregando produtos..." />;

  const baixo = produtos.filter((p) => p.stock > 0 && p.stock <= LIMITE_BAIXO).length;
  const zerado = produtos.filter((p) => p.stock === 0).length;
  const valorEstoque = produtos.reduce((s, p) => s + Number(p.price) * Number(p.stock), 0);
  const imagensPadrao = produtos.filter((p) => isPlaceholderImage(p.image)).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">Catálogo</p><h1 className="mt-1 text-3xl font-bold">Produtos</h1><p className="mt-1 text-sm text-[var(--color-text-secondary)]">Controle de catálogo, preço e estoque.</p></div>
        <Link to="/admin/produtos/novo" className="flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--color-accent-contrast)] hover:bg-[var(--color-accent-hover)]"><Plus size={17}/> Novo produto</Link>
      </div>
      <ErrorBox message={erro} />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Card label="Cadastrados" value={produtos.length} />
        <Card label="Estoque baixo" value={baixo} tone="warning" />
        <Card label="Sem estoque" value={zerado} tone="danger" />
        <Card label="Valor do estoque" value={money.format(valorEstoque)} />
        <Card label="Imagens padrão" value={imagensPadrao} tone={imagensPadrao ? "warning" : undefined} />
      </div>

      <div className="mb-4 grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:grid-cols-[1fr_220px_180px_auto]">
        <input value={busca} onChange={(e) => { setBusca(e.target.value); setPage(1); }} placeholder="Pesquisar produto..." className="admin-input" />
        <select value={categoria} onChange={(e) => { setCategoria(e.target.value); setPage(1); }} className="admin-input"><option value="todas">Todas as categorias</option>{categorias.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="admin-input"><option value="todos">Todos os estoques</option><option>Normal</option><option>Baixo</option><option>Sem estoque</option></select>
        <button type="button" onClick={exportar} className="flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm hover:border-[var(--color-accent)]"><Download size={16}/> CSV</button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-[var(--color-surface-hover)] text-left text-xs uppercase text-[var(--color-text-muted)]"><tr><th className="px-4 py-3">Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Status</th><th className="px-4 text-right">Ações</th></tr></thead>
            <tbody>{exibidos.map((p) => { const [label, cls] = stockStatus(Number(p.stock)); return <tr key={p.id} className="border-t border-[var(--color-border)] hover:bg-white/[0.02]"><td className="px-4 py-3"><div className="flex items-center gap-3">{p.image ? <img src={p.image} alt="" className="h-10 w-10 rounded-lg bg-white object-contain"/> : <div className="h-10 w-10 rounded-lg bg-zinc-800"/>}<div><p className="flex items-center gap-1 font-medium">{p.name}{p.featured && <Star size={12} className="text-[var(--color-accent)]" fill="currentColor"/>}</p><p className="text-xs text-[var(--color-text-muted)]">{p.brand || 'Sem marca'} · ID #{p.id}{isPlaceholderImage(p.image) && <span className="ml-2 font-semibold text-amber-300">· imagem padrão</span>}</p></div></div></td><td>{p.category?.name || '-'}</td><td>{money.format(Number(p.price))}</td><td>{p.stock}</td><td><span className={`rounded-full px-2 py-1 text-xs font-semibold ${cls}`}>{label}</span></td><td className="px-4"><div className="flex justify-end gap-2"><Link to={`/admin/produtos/editar/${p.id}`} className="rounded-lg border border-[var(--color-border)] p-2 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]" title="Editar"><Pencil size={15}/></Link><button type="button" onClick={() => excluir(p.id)} className="rounded-lg border border-[var(--color-border)] p-2 hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]" title="Excluir"><Trash2 size={15}/></button></div></td></tr>; })}</tbody>
          </table>
        </div>
        {!filtrados.length && <p className="p-8 text-center text-sm text-[var(--color-text-muted)]">Nenhum produto encontrado.</p>}
        <Pagination page={pageSafe} onPageChange={setPage} total={filtrados.length} pageSize={pageSize} />
      </div>
    </div>
  );
}

function Card({ label, value, tone }) { const cls = tone === 'danger' ? 'text-[var(--color-danger)]' : tone === 'warning' ? 'text-[var(--color-warning)]' : 'text-[var(--color-accent)]'; return <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"><p className="text-xs text-[var(--color-text-muted)]">{label}</p><p className={`mt-1 text-2xl font-bold ${cls}`}>{value}</p></div>; }
export default Produtos;
