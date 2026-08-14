import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Loading from '../components/Loading';
import { useToast } from '../context/ToastContext';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function Carrinho() {
  const { carrinho, alterarQuantidade, removerItem, totalPreco, carregandoCarrinho } = useCart();
  const toast = useToast();
  const [itemProcessando, setItemProcessando] = useState(null);

  async function executar(produtoId, acao) {
    try { setItemProcessando(produtoId); await acao(); }
    catch (error) { toast.error(error.message || 'Não foi possível atualizar o carrinho.'); }
    finally { setItemProcessando(null); }
  }

  if (carregandoCarrinho && !carrinho.length) return <Loading />;
  if (!carrinho.length) return <main className="grid min-h-[70vh] place-items-center bg-zinc-950 px-4 text-center text-white"><div><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-zinc-900 text-zinc-600"><ShoppingBag size={28}/></div><h1 className="mt-4 text-2xl font-black">Seu carrinho está vazio</h1><p className="mt-2 text-sm text-zinc-500">Adicione produtos para continuar sua compra.</p><Link to="/" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-3 text-sm font-black text-zinc-950">Explorar catálogo <ArrowRight size={16}/></Link></div></main>;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">Sua compra</p><h1 className="mt-1 text-3xl font-black">Carrinho</h1></div>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-3">
            {carrinho.map((item) => {
              const busy = itemProcessando === item.id;
              return <article key={item.id} className="grid grid-cols-[74px_1fr] gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:grid-cols-[84px_1fr_auto] sm:items-center"><img src={item.image || 'https://placehold.co/140x140/18181b/a3e635?text=TG'} alt={item.name} className="h-[74px] w-[74px] rounded-xl bg-white object-contain p-1 sm:h-[84px] sm:w-[84px]"/><div className="min-w-0"><p className="truncate font-semibold">{item.name}</p><p className="mt-1 text-sm font-bold text-lime-300">{money.format(Number(item.price))}</p><p className="mt-1 text-xs text-zinc-600">Disponível: {item.stock}</p><div className="mt-3 flex items-center gap-2 sm:hidden"><Quantity item={item} busy={busy} executar={executar} alterarQuantidade={alterarQuantidade}/><Remove item={item} busy={busy} executar={executar} removerItem={removerItem}/></div></div><div className="hidden items-center gap-3 sm:flex"><Quantity item={item} busy={busy} executar={executar} alterarQuantidade={alterarQuantidade}/><div className="w-24 text-right text-sm font-semibold">{money.format(Number(item.price) * item.quantidade)}</div><Remove item={item} busy={busy} executar={executar} removerItem={removerItem}/></div></article>;
            })}
          </section>

          <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold">Resumo</h2>
            <div className="mt-4 space-y-3 border-b border-zinc-800 pb-4 text-sm"><Row label="Produtos" value={money.format(totalPreco)}/><Row label="Frete" value="Calculado no checkout" muted/></div>
            <div className="flex items-end justify-between py-5"><span className="text-zinc-400">Total</span><strong className="text-2xl text-lime-300">{money.format(totalPreco)}</strong></div>
            <Link to="/checkout" className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime-400 px-5 py-3.5 text-sm font-black text-zinc-950 hover:bg-lime-300">Ir para checkout <ArrowRight size={17}/></Link>
            <Link to="/" className="mt-3 block text-center text-xs text-zinc-500 hover:text-zinc-300">Continuar comprando</Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Quantity({ item, busy, executar, alterarQuantidade }) { return <div className="flex h-9 items-center rounded-lg border border-zinc-800 bg-zinc-950"><button type="button" disabled={busy} onClick={() => executar(item.id, () => alterarQuantidade(item.id, item.quantidade - 1))} className="grid h-9 w-9 place-items-center text-zinc-500 hover:text-white disabled:opacity-40"><Minus size={14}/></button><span className="w-8 text-center text-sm font-bold">{item.quantidade}</span><button type="button" disabled={busy || item.quantidade >= Number(item.stock)} onClick={() => executar(item.id, () => alterarQuantidade(item.id, item.quantidade + 1))} className="grid h-9 w-9 place-items-center text-zinc-500 hover:text-white disabled:opacity-40"><Plus size={14}/></button></div>; }
function Remove({ item, busy, executar, removerItem }) { return <button type="button" disabled={busy} onClick={() => executar(item.id, () => removerItem(item.id))} className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-800 text-zinc-500 hover:border-red-500/30 hover:text-red-300 disabled:opacity-40" aria-label="Remover"><Trash2 size={15}/></button>; }
function Row({ label, value, muted }) { return <div className="flex justify-between gap-4"><span className="text-zinc-500">{label}</span><span className={muted ? 'text-xs text-zinc-600' : 'font-medium'}>{value}</span></div>; }
export default Carrinho;
