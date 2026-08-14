import { CheckCircle2, Copy, CreditCard, MapPin, PackageCheck } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function gerarCodigoPixSimulado() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '00020126580014BR.GOV.BCB.PIX.TECHGARAGE.';
  for (let i = 0; i < 48; i += 1) codigo += chars[Math.floor(Math.random() * chars.length)];
  return codigo;
}

function Checkout() {
  const { usuario } = useAuth();
  const { carrinho, totalPreco, limparCarrinhoLocal } = useCart();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [codigoPix] = useState(gerarCodigoPixSimulado);
  const checkoutKey = useRef(globalThis.crypto?.randomUUID?.() || `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const [pedido, setPedido] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [form, setForm] = useState({ name: usuario?.name || '', phone: usuario?.phone || '', zipCode: '', address: '', number: '', complement: '', neighborhood: '', city: '', state: '' });

  const change = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  const shippingValid = form.name.trim() && form.phone.trim() && /^\d{5}-?\d{3}$/.test(form.zipCode.trim()) && form.address.trim() && form.number.trim() && form.neighborhood.trim() && form.city.trim() && /^[A-Za-z]{2}$/.test(form.state.trim());

  if (!carrinho.length && !pedido) return <main className="grid min-h-[70vh] place-items-center bg-zinc-950 px-4 text-center text-white"><div><p className="text-zinc-400">Seu carrinho está vazio.</p><Link to="/" className="mt-3 inline-block text-lime-300">Voltar ao catálogo</Link></div></main>;

  async function copiarPix() {
    try { await navigator.clipboard.writeText(codigoPix); toast.success('Código PIX copiado.'); }
    catch { toast.error('Não foi possível copiar automaticamente.'); }
  }

  async function finalizar() {
    try {
      setProcessando(true);
      const { data } = await api.post('/checkout', { paymentType: 'PIX', pixCode: codigoPix, shipping: form, checkoutKey: checkoutKey.current });
      setPedido(data);
      limparCarrinhoLocal();
      setStep(3);
      toast.success('Pedido confirmado com sucesso.');
    } catch (error) { toast.error(error.response?.data?.message || 'Não foi possível concluir a compra.'); }
    finally { setProcessando(false); }
  }

  if (step === 3 && pedido) return <main className="grid min-h-[78vh] place-items-center bg-zinc-950 px-4 text-center text-white"><div className="max-w-lg rounded-3xl border border-emerald-500/20 bg-zinc-900/70 p-8"><CheckCircle2 className="mx-auto text-emerald-400" size={52}/><p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Pagamento aprovado</p><h1 className="mt-2 text-3xl font-black">Pedido #{pedido.id} confirmado</h1><p className="mt-3 text-sm leading-6 text-zinc-400">Seu pedido já está registrado. Você pode acompanhar as próximas etapas pela área “Meus pedidos”.</p><div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center"><Link to={`/pedidos/${pedido.id}`} className="rounded-xl bg-lime-400 px-5 py-3 text-sm font-black text-zinc-950">Acompanhar pedido</Link><Link to="/" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold">Voltar à loja</Link></div></div></main>;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">Finalização</p><h1 className="mt-1 text-3xl font-black">Checkout</h1><div className="mt-5 flex max-w-xl items-center gap-2"><Step active={step >= 1} number="1" label="Entrega"/><Line active={step >= 2}/><Step active={step >= 2} number="2" label="Pagamento"/><Line/><Step number="3" label="Confirmado"/></div></div>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section>
            {step === 1 && <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6"><div className="mb-5 flex items-center gap-2"><MapPin className="text-lime-300" size={19}/><h2 className="font-bold">Dados de entrega</h2></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Nome completo"><input className="store-input" name="name" value={form.name} onChange={change}/></Field><Field label="Telefone"><input className="store-input" name="phone" value={form.phone} onChange={change} placeholder="(41) 99999-9999"/></Field><Field label="CEP"><input className="store-input" name="zipCode" value={form.zipCode} onChange={change} placeholder="80000-000"/></Field><Field label="Rua / Avenida"><input className="store-input" name="address" value={form.address} onChange={change}/></Field><Field label="Número"><input className="store-input" name="number" value={form.number} onChange={change}/></Field><Field label="Complemento"><input className="store-input" name="complement" value={form.complement} onChange={change} placeholder="Opcional"/></Field><Field label="Bairro"><input className="store-input" name="neighborhood" value={form.neighborhood} onChange={change}/></Field><Field label="Cidade"><input className="store-input" name="city" value={form.city} onChange={change}/></Field><Field label="UF"><input maxLength={2} className="store-input uppercase" name="state" value={form.state} onChange={change} placeholder="PR"/></Field></div><button type="button" disabled={!shippingValid} onClick={() => setStep(2)} className="mt-6 rounded-xl bg-lime-400 px-6 py-3 text-sm font-black text-zinc-950 hover:bg-lime-300 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600">Continuar para pagamento</button></div>}
            {step === 2 && <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6"><div className="mb-5 flex items-center gap-2"><CreditCard className="text-lime-300" size={19}/><h2 className="font-bold">Pagamento via PIX</h2></div><div className="rounded-2xl border border-lime-400/20 bg-lime-400/5 p-5"><p className="text-xs font-bold uppercase tracking-wider text-lime-300">PIX copia e cola</p><p className="mt-3 break-all rounded-xl bg-zinc-950 p-4 font-mono text-xs leading-5 text-zinc-400">{codigoPix}</p><button type="button" onClick={copiarPix} className="mt-3 flex items-center gap-2 text-sm font-semibold text-lime-300"><Copy size={15}/> Copiar código</button></div><div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-xs leading-5 text-amber-200/80"><strong>Ambiente de demonstração:</strong> este PIX é simulado. O botão abaixo confirma o pagamento no sistema para testar o fluxo completo.</div><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => setStep(1)} className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300">Voltar</button><button type="button" disabled={processando} onClick={finalizar} className="flex items-center gap-2 rounded-xl bg-lime-400 px-6 py-3 text-sm font-black text-zinc-950 hover:bg-lime-300 disabled:opacity-50"><PackageCheck size={17}/>{processando ? 'Confirmando...' : 'Simular pagamento e finalizar'}</button></div></div>}
          </section>
          <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 lg:sticky lg:top-24"><h2 className="font-bold">Resumo do pedido</h2><div className="mt-4 max-h-80 space-y-3 overflow-auto pr-1">{carrinho.map((item) => <div key={item.id} className="flex gap-3"><img src={item.image || 'https://placehold.co/90x90/18181b/a3e635?text=TG'} alt="" className="h-12 w-12 rounded-lg bg-white object-contain"/><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{item.name}</p><p className="text-[11px] text-zinc-500">{item.quantidade} × {money.format(Number(item.price))}</p></div><strong className="text-xs">{money.format(Number(item.price) * item.quantidade)}</strong></div>)}</div><div className="mt-5 flex items-end justify-between border-t border-zinc-800 pt-5"><span className="text-sm text-zinc-500">Total</span><strong className="text-2xl text-lime-300">{money.format(totalPreco)}</strong></div></aside>
        </div>
      </div>
    </main>
  );
}
function Field({ label, children }) { return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-zinc-400">{label}</span>{children}</label>; }
function Step({ active, number, label }) { return <div className="flex items-center gap-2"><span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-black ${active ? 'bg-lime-400 text-zinc-950' : 'bg-zinc-800 text-zinc-600'}`}>{number}</span><span className={`hidden text-xs sm:block ${active ? 'text-zinc-200' : 'text-zinc-600'}`}>{label}</span></div>; }
function Line({ active }) { return <div className={`h-px flex-1 ${active ? 'bg-lime-400' : 'bg-zinc-800'}`}/>; }
export default Checkout;
