import { ArrowLeft, Minus, Plus, ShieldCheck, ShoppingCart, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function Produto() {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [adicionando, setAdicionando] = useState(false);
  const { adicionarItem, carrinho } = useCart();
  const { usuario } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    api.get(`/products/${id}`).then(({ data }) => { if (active) setProduto(data); }).catch((error) => { if (active) setErro(error.response?.data?.message || 'Produto não encontrado.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <Loading />;
  if (erro || !produto) return <div className="mx-auto max-w-5xl px-4 py-20 text-center text-red-300">{erro || 'Produto não encontrado.'}</div>;

  const existing = carrinho.find((item) => item.id === produto.id);
  const availableToAdd = Math.max(0, Number(produto.stock) - Number(existing?.quantidade || 0));

  async function adicionar() {
    if (!usuario) { navigate('/login'); return; }
    if (quantidade > availableToAdd) { toast.error(`Você pode adicionar no máximo ${availableToAdd} unidade(s).`); return; }
    try {
      setAdicionando(true);
      await adicionarItem(produto, quantidade);
      toast.success(`${quantidade} unidade(s) adicionada(s) ao carrinho.`);
    } catch (error) { toast.error(error.message); }
    finally { setAdicionando(false); }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-lime-300"><ArrowLeft size={16}/> Voltar ao catálogo</Link>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-white p-8"><img src={produto.image || 'https://placehold.co/800x600/18181b/a3e635?text=TechGarage'} alt={produto.name} className="mx-auto max-h-[520px] w-full object-contain"/></div>
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">{produto.brand || produto.category?.name || 'TechGarage'}</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{produto.name}</h1>
            <p className="mt-4 whitespace-pre-line leading-7 text-zinc-400">{produto.description || 'Produto selecionado para o catálogo TechGarage.'}</p>
            <div className="mt-7 border-y border-zinc-800 py-5"><p className="text-xs text-zinc-500">Preço no PIX</p><p className="text-4xl font-black text-lime-300">{money.format(Number(produto.price))}</p><p className="mt-1 text-xs text-zinc-500">Estoque disponível: {produto.stock}</p></div>
            <div className="mt-6 flex flex-wrap gap-3"><div className="flex h-12 items-center rounded-xl border border-zinc-800 bg-zinc-900"><button type="button" onClick={() => setQuantidade((q) => Math.max(1, q - 1))} className="grid h-12 w-12 place-items-center text-zinc-400 hover:text-white"><Minus size={16}/></button><span className="w-10 text-center font-bold">{quantidade}</span><button type="button" onClick={() => setQuantidade((q) => Math.min(Math.max(1, availableToAdd), q + 1))} className="grid h-12 w-12 place-items-center text-zinc-400 hover:text-white"><Plus size={16}/></button></div><button type="button" disabled={Number(produto.stock) === 0 || adicionando || availableToAdd === 0} onClick={adicionar} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-lime-400 px-5 font-black text-zinc-950 hover:bg-lime-300 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600"><ShoppingCart size={18}/>{adicionando ? 'Adicionando...' : availableToAdd === 0 && existing ? 'Limite no carrinho' : 'Adicionar ao carrinho'}</button></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2"><Info icon={ShieldCheck} title="Compra protegida" text="Pedido vinculado à sua conta."/><Info icon={Truck} title="Entrega cadastrada" text="Endereço confirmado no checkout."/></div>
          </div>
        </div>
      </div>
    </main>
  );
}
function Info({ icon: Icon, title, text }) { return <div className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"><Icon className="mt-0.5 text-lime-300" size={18}/><div><p className="text-sm font-semibold">{title}</p><p className="text-xs text-zinc-500">{text}</p></div></div>; }
export default Produto;
