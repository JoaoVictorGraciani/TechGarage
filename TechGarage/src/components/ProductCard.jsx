import { ShoppingCart, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function ProductCard({ produto, nomeCategoria }) {
  const { adicionarItem } = useCart();
  const { usuario } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [adicionando, setAdicionando] = useState(false);
  const semEstoque = Number(produto.stock) <= 0;

  const handleAdicionar = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!usuario) { navigate('/login'); return; }
    try {
      setAdicionando(true);
      await adicionarItem(produto);
      toast.success(`${produto.name} adicionado ao carrinho.`);
    } catch (error) { toast.error(error.message || 'Não foi possível adicionar ao carrinho.'); }
    finally { setAdicionando(false); }
  };

  return (
    <Link to={`/produto/${produto.id}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 transition duration-200 hover:-translate-y-1 hover:border-lime-400/40 hover:shadow-xl hover:shadow-lime-500/5">
      <div className="relative aspect-[4/3] overflow-hidden bg-white">
        <img src={produto.image || 'https://placehold.co/600x450/18181b/a3e635?text=TechGarage'} alt={produto.name} className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex gap-2">
          {produto.featured && <span className="flex items-center gap-1 rounded-full bg-lime-400 px-2 py-1 text-[10px] font-black uppercase text-zinc-950"><Star size={10} fill="currentColor"/> Destaque</span>}
          <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${semEstoque ? 'bg-red-500 text-white' : Number(produto.stock) <= 5 ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-950/85 text-zinc-200'}`}>{semEstoque ? 'Sem estoque' : Number(produto.stock) <= 5 ? `Últimas ${produto.stock}` : 'Disponível'}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{produto.brand || nomeCategoria}</p>
        <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold text-zinc-100">{produto.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">{produto.description || 'Tecnologia selecionada pela TechGarage.'}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div><p className="text-[10px] text-zinc-500">à vista no PIX</p><p className="text-lg font-black text-lime-300">{money.format(Number(produto.price))}</p></div>
          <button type="button" disabled={semEstoque || adicionando} onClick={handleAdicionar} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lime-400 text-zinc-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600" aria-label="Adicionar ao carrinho"><ShoppingCart size={18}/></button>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
