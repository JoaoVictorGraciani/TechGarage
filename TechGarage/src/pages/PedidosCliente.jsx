import { ChevronRight, PackageCheck, PackageOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const date = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' });
const labels = { PENDING: 'Pendente', PAID: 'Pago', PROCESSING: 'Preparando', SHIPPED: 'Enviado', DELIVERED: 'Entregue', CANCELED: 'Cancelado' };

function PedidosCliente() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  useEffect(() => { let active = true; api.get('/orders/my').then(({ data }) => { if (active) setPedidos(data); }).catch((error) => { if (active) setErro(error.response?.data?.message || 'Não foi possível carregar seus pedidos.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  if (loading) return <Loading />;

  return <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white md:px-6"><div className="mx-auto max-w-5xl"><div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">Minha conta</p><h1 className="mt-1 text-3xl font-black">Meus pedidos</h1><p className="mt-1 text-sm text-zinc-500">Acompanhe o status e os itens de cada compra.</p></div>{erro && <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{erro}</p>}{!pedidos.length ? <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center"><PackageOpen className="mx-auto text-zinc-600" size={38}/><p className="mt-3 font-semibold">Você ainda não fez nenhum pedido.</p><Link to="/" className="mt-3 inline-block text-sm text-lime-300">Explorar catálogo</Link></div> : <div className="space-y-3">{pedidos.map((pedido) => <Link key={pedido.id} to={`/pedidos/${pedido.id}`} className="grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition hover:border-zinc-600 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center"><div className="grid h-11 w-11 place-items-center rounded-xl bg-lime-400/10 text-lime-300"><PackageCheck size={20}/></div><div><p className="font-bold">Pedido #{pedido.id}</p><p className="text-xs text-zinc-500">{date.format(new Date(pedido.createdAt))} · {pedido.items?.length || 0} item(ns)</p></div><div className="sm:text-right"><Status status={pedido.status}/><p className="mt-1 font-bold text-lime-300">{money.format(Number(pedido.totalValue))}</p></div><ChevronRight className="hidden text-zinc-600 sm:block" size={18}/></Link>)}</div>}</div></main>;
}

export function Status({ status }) { const cls = { PENDING: 'bg-amber-400/10 text-amber-300', PAID: 'bg-sky-400/10 text-sky-300', PROCESSING: 'bg-violet-400/10 text-violet-300', SHIPPED: 'bg-cyan-400/10 text-cyan-300', DELIVERED: 'bg-emerald-400/10 text-emerald-300', CANCELED: 'bg-red-400/10 text-red-300' }[status] || 'bg-zinc-800 text-zinc-300'; return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${cls}`}>{labels[status] || status}</span>; }
export default PedidosCliente;
