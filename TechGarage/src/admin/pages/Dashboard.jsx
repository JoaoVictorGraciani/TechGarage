import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CircleDollarSign, ReceiptText, TrendingUp, Users } from 'lucide-react';
import api from '../../services/api';
import { ErrorBox, LoadingAdmin } from '../components/AdminFeedback';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const statusLabel = { PENDING:'Pendente', PAID:'Pago', PROCESSING:'Preparando', SHIPPED:'Enviado', DELIVERED:'Entregue', CANCELED:'Cancelado' };

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => { let active = true; async function load(){ try { setLoading(true); const {data:payload}=await api.get('/admin/dashboard'); if(active)setData(payload); } catch(error){ if(active)setErro(error.response?.data?.message||'Não foi possível carregar o dashboard.'); } finally { if(active)setLoading(false); }} load(); return()=>{active=false;}; }, []);
  const maxRevenue = useMemo(() => Math.max(1, ...(data?.sales7 || []).map((day) => Number(day.revenue))), [data]);
  if (loading) return <LoadingAdmin text="Calculando indicadores..."/>;
  if (!data) return <div><ErrorBox message={erro || 'Dashboard indisponível.'}/></div>;
  const m = data.metrics;

  return <div>
    <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">Visão geral</p><h1 className="mt-1 text-3xl font-black">Dashboard</h1><p className="mt-1 text-sm text-zinc-500">Indicadores processados pelo backend, sem depender de carregar o banco inteiro no navegador.</p></div><ErrorBox message={erro}/>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><Metric icon={CircleDollarSign} label="Faturamento 30 dias" value={money.format(m.revenue30)}/><Metric icon={ReceiptText} label="Pedidos pagos 30 dias" value={m.revenueOrders30}/><Metric icon={TrendingUp} label="Ticket médio" value={money.format(m.ticketAverage)}/><Metric icon={Users} label="Clientes" value={m.clients} detail={`${m.users} usuários totais`}/><Metric icon={AlertTriangle} label="Estoque baixo" value={m.lowStock} detail="5 unidades ou menos" warning={m.lowStock > 0}/></div>

    <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_.75fr]">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"><div className="mb-6 flex items-end justify-between"><div><h2 className="font-bold">Vendas nos últimos 7 dias</h2><p className="text-xs text-zinc-600">Receita de pedidos pagos/ativos</p></div><span className="text-xs text-zinc-600">R$ / dia</span></div><div className="flex h-56 items-end gap-3">{data.sales7.map((day) => { const height = Math.max(4, (Number(day.revenue)/maxRevenue)*100); return <div key={day.date} className="flex h-full flex-1 flex-col justify-end"><div className="group relative flex-1"><div className="absolute bottom-0 w-full rounded-t-lg bg-lime-400/75 transition hover:bg-lime-300" style={{height:`${height}%`}}/><div className="pointer-events-none absolute bottom-[calc(var(--h)+6px)] left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] group-hover:block" style={{'--h':`${height}%`}}>{money.format(Number(day.revenue))}</div></div><p className="mt-2 text-center text-[10px] text-zinc-600">{new Date(`${day.date}T12:00:00`).toLocaleDateString('pt-BR',{weekday:'short'}).replace('.','')}</p></div>; })}</div></section>
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"><h2 className="font-bold">Operação</h2><div className="mt-5 space-y-3">{Object.entries(data.statusCounts).map(([status,count]) => <div key={status} className="flex items-center justify-between"><span className="text-sm text-zinc-400">{statusLabel[status] || status}</span><strong>{count}</strong></div>)}</div><div className="mt-5 border-t border-zinc-800 pt-4"><Summary label="Produtos" value={m.products}/><Summary label="Categorias" value={m.categories}/><Summary label="Unidades em estoque" value={m.stockUnits}/></div></section>
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60"><div className="border-b border-zinc-800 px-5 py-4"><h2 className="font-bold">Pedidos recentes</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-sm"><thead className="text-left text-xs uppercase text-zinc-600"><tr><th className="px-5 py-3">Pedido</th><th>Cliente</th><th>Total</th><th>Status</th><th>Data</th></tr></thead><tbody>{data.recentOrders.map((o)=><tr key={o.id} className="border-t border-zinc-800"><td className="px-5 py-3 font-bold">#{o.id}</td><td>{o.user?.name||'-'}</td><td>{money.format(Number(o.totalValue))}</td><td><OrderStatus status={o.status}/></td><td className="text-zinc-500">{dateTime.format(new Date(o.createdAt))}</td></tr>)}</tbody></table></div></section>
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"><h2 className="font-bold">Mais vendidos · 30 dias</h2><div className="mt-4 space-y-3">{data.topProducts.length ? data.topProducts.map((p,index)=><div key={p.id} className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-lg bg-zinc-800 text-xs font-bold text-zinc-400">{index+1}</span><img src={p.image||'https://placehold.co/80x80/18181b/a3e635?text=TG'} alt="" className="h-10 w-10 rounded-lg bg-white object-contain"/><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{p.name}</p><p className="text-xs text-zinc-600">{p.quantitySold} unidade(s) vendida(s)</p></div></div>) : <p className="text-sm text-zinc-600">Ainda não há vendas suficientes.</p>}</div></section>
    </div>

    {data.lowStockProducts.length > 0 && <section className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5"><div className="mb-4 flex items-center gap-2 text-amber-300"><AlertTriangle size={18}/><h2 className="font-bold">Reposição necessária</h2></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{data.lowStockProducts.map((p)=><div key={p.id} className="rounded-xl border border-amber-400/10 bg-zinc-950/50 p-3"><p className="truncate text-sm font-semibold">{p.name}</p><p className="mt-1 text-xs text-amber-300">{p.stock} unidade(s) · {p.category?.name}</p></div>)}</div></section>}
  </div>;
}

function Metric({icon:Icon,label,value,detail,warning}) { return <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"><div className="flex items-center justify-between"><p className="text-xs text-zinc-500">{label}</p><Icon size={18} className={warning?'text-amber-300':'text-lime-300'}/></div><p className={`mt-3 text-2xl font-black ${warning?'text-amber-300':''}`}>{value}</p>{detail&&<p className="mt-1 text-xs text-zinc-600">{detail}</p>}</div>; }
function Summary({label,value}) { return <div className="mb-2 flex justify-between text-sm"><span className="text-zinc-500">{label}</span><strong>{value}</strong></div>; }
export function OrderStatus({status}) { const cls={PAID:'bg-sky-400/10 text-sky-300',PENDING:'bg-amber-400/10 text-amber-300',PROCESSING:'bg-violet-400/10 text-violet-300',SHIPPED:'bg-cyan-400/10 text-cyan-300',DELIVERED:'bg-emerald-400/10 text-emerald-300',CANCELED:'bg-red-400/10 text-red-300'}[status]||'bg-zinc-800 text-zinc-300'; return <span className={`rounded-full px-2 py-1 text-xs font-bold ${cls}`}>{statusLabel[status]||status}</span>; }
export default Dashboard;
