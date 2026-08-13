import { useMemo, useState } from 'react';
import { ArrowRight, BadgeCheck, Filter, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProdutos } from '../hooks/useProdutos';
import ProductGrid from '../components/ProductGrid';
import Loading from '../components/Loading';
import { slugify } from '../utils/slugify';

function Home() {
  const { produtos, categorias, loading, erro } = useProdutos();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [ordem, setOrdem] = useState('destaques');
  const [somenteEstoque, setSomenteEstoque] = useState(false);
  const [precoMax, setPrecoMax] = useState('');

  const termoBusca = searchParams.get('busca')?.trim().toLowerCase() || '';
  const categoriaSlug = searchParams.get('categoria') || '';

  const produtosFiltrados = useMemo(() => {
    let result = [...produtos];
    const cat = categorias.find((c) => slugify(c.name) === categoriaSlug);
    if (cat) result = result.filter((p) => Number(p.categoryId) === Number(cat.id));
    if (termoBusca) result = result.filter((p) => `${p.name} ${p.brand || ''} ${p.description || ''}`.toLowerCase().includes(termoBusca));
    if (somenteEstoque) result = result.filter((p) => Number(p.stock) > 0);
    if (precoMax && Number(precoMax) >= 0) result = result.filter((p) => Number(p.price) <= Number(precoMax));
    if (ordem === 'menor') result.sort((a, b) => Number(a.price) - Number(b.price));
    else if (ordem === 'maior') result.sort((a, b) => Number(b.price) - Number(a.price));
    else if (ordem === 'nome') result.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    else result.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.id - a.id);
    return result;
  }, [produtos, categorias, categoriaSlug, termoBusca, somenteEstoque, precoMax, ordem]);

  if (loading) return <Loading />;
  if (erro) return <p className="py-20 text-center text-red-400">{erro}</p>;

  const categoriaAtiva = categorias.find((c) => slugify(c.name) === categoriaSlug);
  const limparFiltros = () => { setSearchParams({}); setSomenteEstoque(false); setPrecoMax(''); setOrdem('destaques'); };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {!termoBusca && !categoriaSlug && (
        <section className="border-b border-zinc-900 bg-[radial-gradient(circle_at_75%_25%,rgba(163,230,53,.15),transparent_34%),linear-gradient(180deg,#09090b,#0d0d10)]">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 md:px-6 lg:grid-cols-[1.15fr_.85fr] lg:py-20">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/5 px-3 py-1.5 text-xs font-semibold text-lime-300"><BadgeCheck size={14}/> Seleção TechGarage 2026</div>
              <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">Performance de verdade, <span className="text-lime-300">sem hardware genérico.</span></h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">Componentes, periféricos e equipamentos para quem prioriza desempenho, confiabilidade e um setup bem montado.</p>
              <div className="mt-7 flex flex-wrap gap-3"><a href="#catalogo" className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-3 text-sm font-black text-zinc-950 hover:bg-lime-300">Ver catálogo <ArrowRight size={17}/></a><Link to="/?categoria=gamer" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 hover:border-zinc-500">Linha Gamer</Link></div>
            </div>
            <div className="relative hidden lg:block"><div className="absolute inset-8 rounded-full bg-lime-400/10 blur-3xl"/><div className="relative grid grid-cols-2 gap-3 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-2xl"><HeroStat value={`${produtos.length}+`} label="produtos"/><HeroStat value={`${categorias.length}`} label="categorias"/><HeroStat value="PIX" label="checkout rápido"/><HeroStat value="24/7" label="catálogo online"/></div></div>
          </div>
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 pb-8 md:grid-cols-3 md:px-6"><Benefit icon={Truck} title="Compra rápida" text="Fluxo direto do catálogo ao checkout."/><Benefit icon={ShieldCheck} title="Conta protegida" text="Sessão segura e pedidos vinculados ao usuário."/><Benefit icon={BadgeCheck} title="Estoque real" text="Validação no checkout evita venda acima do disponível."/></div>
        </section>
      )}

      <section id="catalogo" className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">Catálogo</p><h2 className="mt-1 text-3xl font-black">{categoriaAtiva?.name || (termoBusca ? `Resultados para “${searchParams.get('busca')}”` : 'Produtos em destaque')}</h2><p className="mt-1 text-sm text-zinc-500">{produtosFiltrados.length} produto(s) encontrado(s)</p></div>
          <button type="button" onClick={() => setFiltrosAbertos((v) => !v)} className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-300 hover:border-zinc-600"><Filter size={16}/> Filtros</button>
        </div>

        {filtrosAbertos && <div className="mb-6 grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end"><Field label="Ordenar"><select value={ordem} onChange={(e) => setOrdem(e.target.value)} className="store-input"><option value="destaques">Destaques</option><option value="menor">Menor preço</option><option value="maior">Maior preço</option><option value="nome">Nome A–Z</option></select></Field><Field label="Preço máximo"><input type="number" min="0" value={precoMax} onChange={(e) => setPrecoMax(e.target.value)} placeholder="Ex.: 3000" className="store-input"/></Field><label className="flex h-11 items-center gap-2 rounded-xl border border-zinc-800 px-3 text-sm text-zinc-300"><input type="checkbox" checked={somenteEstoque} onChange={(e) => setSomenteEstoque(e.target.checked)} className="accent-lime-400"/> Só disponíveis</label><button type="button" onClick={limparFiltros} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-800 px-4 text-sm text-zinc-400 hover:text-white"><RotateCcw size={15}/> Limpar</button></div>}

        <ProductGrid produtos={produtosFiltrados} categorias={categorias} />
      </section>
    </main>
  );
}

function Field({ label, children }) { return <label className="block"><span className="mb-1.5 block text-xs font-medium text-zinc-500">{label}</span>{children}</label>; }
function HeroStat({ value, label }) { return <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5"><p className="text-3xl font-black text-lime-300">{value}</p><p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">{label}</p></div>; }
function Benefit({ icon: Icon, title, text }) { return <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4"><div className="grid h-10 w-10 place-items-center rounded-xl bg-lime-400/10 text-lime-300"><Icon size={19}/></div><div><p className="text-sm font-semibold">{title}</p><p className="text-xs text-zinc-500">{text}</p></div></div>; }
export default Home;
