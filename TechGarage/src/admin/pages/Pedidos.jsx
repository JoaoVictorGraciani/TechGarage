import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { ErrorBox, LoadingAdmin } from '../components/AdminFeedback';
import { OrderStatus } from './Dashboard';
import Pagination from '../components/Pagination';
import { useToast } from '../../context/ToastContext';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const options = {
  PENDING: [['PENDING','Pendente'],['PAID','Marcar pago'],['CANCELED','Cancelar']],
  PAID: [['PAID','Pago'],['PROCESSING','Iniciar separação'],['CANCELED','Cancelar']],
  PROCESSING: [['PROCESSING','Preparando'],['SHIPPED','Marcar enviado'],['CANCELED','Cancelar']],
  SHIPPED: [['SHIPPED','Enviado'],['DELIVERED','Marcar entregue']],
  DELIVERED: [['DELIVERED','Entregue']],
  CANCELED: [['CANCELED','Cancelado'],['PAID','Reativar como pago']],
};

function Pedidos() {
  const [pedidos,setPedidos]=useState([]); const [loading,setLoading]=useState(true); const [erro,setErro]=useState(''); const [busca,setBusca]=useState(''); const [status,setStatus]=useState('todos'); const [open,setOpen]=useState(null); const [updating,setUpdating]=useState(null); const [page,setPage]=useState(1); const toast=useToast();
  useEffect(()=>{let active=true;api.get('/orders').then(({data})=>{if(active)setPedidos(data)}).catch((error)=>{if(active)setErro(error.response?.data?.message||'Não foi possível carregar os pedidos.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[]);
  const filtrados=useMemo(()=>pedidos.filter((o)=>{const term=busca.trim().toLowerCase();const match=!term||String(o.id).includes(term)||o.user?.name?.toLowerCase().includes(term)||o.user?.email?.toLowerCase().includes(term)||o.shippingCity?.toLowerCase().includes(term);return match&&(status==='todos'||o.status===status)}),[pedidos,busca,status]);
  const pageSize=8; const totalPages=Math.max(1,Math.ceil(filtrados.length/pageSize)); const pageSafe=Math.min(page,totalPages); const exibidos=filtrados.slice((pageSafe-1)*pageSize,pageSafe*pageSize);
  async function mudarStatus(order,newStatus){if(newStatus===order.status)return;if(newStatus==='CANCELED'&&!window.confirm(`Cancelar o pedido #${order.id}? O estoque será devolvido.`))return;try{setUpdating(order.id);setErro('');const {data}=await api.patch(`/orders/${order.id}/status`,{status:newStatus});setPedidos((old)=>old.map((o)=>o.id===order.id?data:o));toast.success(`Pedido #${order.id} atualizado.`);}catch(error){const msg=error.response?.data?.message||'Não foi possível atualizar o pedido.';setErro(msg);toast.error(msg);}finally{setUpdating(null)}}
  if(loading)return <LoadingAdmin text="Carregando pedidos..."/>;
  return <div><div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">Vendas</p><h1 className="mt-1 text-3xl font-black">Pedidos</h1><p className="mt-1 text-sm text-zinc-500">Fluxo operacional: Pago → Preparando → Enviado → Entregue.</p></div><ErrorBox message={erro}/>
    <div className="mb-4 grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:grid-cols-[1fr_220px]"><input className="admin-input" value={busca} onChange={(e)=>{setBusca(e.target.value);setPage(1)}} placeholder="Pedido, cliente, e-mail ou cidade..."/><select className="admin-input" value={status} onChange={(e)=>{setStatus(e.target.value);setPage(1)}}><option value="todos">Todos os status</option><option value="PENDING">Pendente</option><option value="PAID">Pago</option><option value="PROCESSING">Preparando</option><option value="SHIPPED">Enviado</option><option value="DELIVERED">Entregue</option><option value="CANCELED">Cancelado</option></select></div>
    <div className="space-y-3">{exibidos.map((o)=><article key={o.id} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60"><div className="grid items-center gap-4 p-4 md:grid-cols-[90px_1fr_150px_130px_190px_40px]"><div><p className="text-xs text-zinc-600">Pedido</p><p className="font-black">#{o.id}</p></div><div><p className="font-semibold">{o.user?.name||'-'}</p><p className="text-xs text-zinc-600">{o.user?.email||'-'}</p></div><div><p className="text-xs text-zinc-600">Total</p><p className="font-bold">{money.format(Number(o.totalValue))}</p></div><OrderStatus status={o.status}/><select disabled={updating===o.id} value={o.status} onChange={(e)=>mudarStatus(o,e.target.value)} className="admin-input py-1.5">{(options[o.status]||[[o.status,o.status]]).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><button type="button" onClick={()=>setOpen(open===o.id?null:o.id)} className="rounded-lg p-2 hover:bg-zinc-800">{open===o.id?<ChevronUp size={17}/>:<ChevronDown size={17}/>}</button></div>
      {open===o.id&&<div className="grid gap-5 border-t border-zinc-800 bg-black/10 p-4 lg:grid-cols-[1fr_300px]"><div><div className="mb-3 flex flex-wrap gap-x-8 gap-y-1 text-xs text-zinc-600"><span>Criado em {dateTime.format(new Date(o.createdAt))}</span><span>Pagamento: {o.payments?.[0]?.type||'—'} / {o.payments?.[0]?.status||'—'}</span></div><div className="space-y-2">{o.items?.map((item)=><div key={item.id} className="flex items-center justify-between rounded-xl bg-zinc-950 px-3 py-2 text-sm"><span>{item.product?.name||`Produto #${item.productId}`} <span className="text-zinc-600">× {item.quantity}</span></span><strong>{money.format(Number(item.unitPrice)*item.quantity)}</strong></div>)}</div></div><div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4"><div className="mb-2 flex items-center gap-2 text-sm font-bold"><MapPin size={15} className="text-lime-300"/> Entrega</div>{o.shippingAddress?<div className="text-xs leading-5 text-zinc-500"><p className="text-zinc-300">{o.shippingName}</p><p>{o.shippingAddress}, {o.shippingNumber}</p>{o.shippingComplement&&<p>{o.shippingComplement}</p>}<p>{o.shippingNeighborhood}</p><p>{o.shippingCity}/{o.shippingState} · {o.shippingZipCode}</p><p>{o.shippingPhone}</p></div>:<p className="text-xs text-zinc-600">Pedido antigo sem endereço registrado.</p>}</div></div>}
    </article>)}{!filtrados.length&&<p className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center text-sm text-zinc-600">Nenhum pedido encontrado.</p>}{filtrados.length>0&&<div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40"><Pagination page={pageSafe} onPageChange={setPage} total={filtrados.length} pageSize={pageSize}/></div>}</div>
  </div>;
}
export default Pedidos;
