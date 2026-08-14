import { ArrowLeft, MapPin, Package, ReceiptText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';
import { Status } from './PedidosCliente';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const statusSteps = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

function PedidoDetalhe() {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  useEffect(() => { let active = true; api.get(`/orders/${id}`).then(({ data }) => { if (active) setPedido(data); }).catch((error) => { if (active) setErro(error.response?.data?.message || 'Pedido não encontrado.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [id]);
  if (loading) return <Loading />;
  if (erro || !pedido) return <main className="min-h-screen bg-zinc-950 py-20 text-center text-red-300">{erro || 'Pedido não encontrado.'}</main>;

  const currentStep = statusSteps.indexOf(pedido.status);
  return <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white md:px-6"><div className="mx-auto max-w-5xl"><Link to="/pedidos" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-lime-300"><ArrowLeft size={16}/> Meus pedidos</Link><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">Pedido #{pedido.id}</p><h1 className="mt-1 text-3xl font-black">Detalhes da compra</h1></div><Status status={pedido.status}/></div>
  {pedido.status !== 'CANCELED' && pedido.status !== 'PENDING' && <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"><p className="mb-4 text-sm font-semibold">Acompanhamento</p><div className="grid grid-cols-4 gap-2">{statusSteps.map((step, index) => <div key={step}><div className={`h-1.5 rounded-full ${index <= currentStep ? 'bg-lime-400' : 'bg-zinc-800'}`}/><p className={`mt-2 text-[10px] sm:text-xs ${index <= currentStep ? 'text-lime-300' : 'text-zinc-600'}`}>{({ PAID:'Pago', PROCESSING:'Preparando', SHIPPED:'Enviado', DELIVERED:'Entregue' })[step]}</p></div>)}</div></div>}
  <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]"><section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"><div className="mb-4 flex items-center gap-2"><Package size={18} className="text-lime-300"/><h2 className="font-bold">Itens</h2></div><div className="space-y-3">{pedido.items?.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3"><img src={item.product?.image || 'https://placehold.co/100x100/18181b/a3e635?text=TG'} alt="" className="h-14 w-14 rounded-lg bg-white object-contain p-1"/><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.product?.name || `Produto #${item.productId}`}</p><p className="text-xs text-zinc-500">{item.quantity} × {money.format(Number(item.unitPrice))}</p></div><strong className="text-sm">{money.format(Number(item.unitPrice) * item.quantity)}</strong></div>)}</div><div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-4"><span className="text-zinc-400">Total</span><strong className="text-2xl text-lime-300">{money.format(Number(pedido.totalValue))}</strong></div></section><aside className="space-y-5"><Box icon={MapPin} title="Entrega"><p>{pedido.shippingName || '—'}</p><p>{pedido.shippingAddress ? `${pedido.shippingAddress}, ${pedido.shippingNumber}` : 'Endereço não registrado'}</p>{pedido.shippingComplement && <p>{pedido.shippingComplement}</p>}<p>{pedido.shippingNeighborhood || ''}</p><p>{pedido.shippingCity ? `${pedido.shippingCity}/${pedido.shippingState} · ${pedido.shippingZipCode}` : ''}</p></Box><Box icon={ReceiptText} title="Pagamento"><p>PIX</p><p>Status: {pedido.payments?.[0]?.status || '—'}</p><p className="mt-2 text-xs text-zinc-600">Criado em {new Date(pedido.createdAt).toLocaleString('pt-BR')}</p></Box></aside></div></div></main>;
}
function Box({ icon: Icon, title, children }) { return <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"><div className="mb-3 flex items-center gap-2"><Icon size={17} className="text-lime-300"/><h2 className="font-bold">{title}</h2></div><div className="text-sm leading-6 text-zinc-400">{children}</div></div>; }
export default PedidoDetalhe;
