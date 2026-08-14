import { Check, Search, TriangleAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { ErrorBox, LoadingAdmin } from '../components/AdminFeedback';
import { useToast } from '../../context/ToastContext';

function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [somenteBaixo, setSomenteBaixo] = useState(false);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(null);
  const toast = useToast();

  useEffect(()=>{let active=true;api.get('/products?sort=stock_asc').then(({data})=>{if(active)setProdutos(data)}).catch((error)=>{if(active)setErro(error.response?.data?.message||'Não foi possível carregar o estoque.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[]);
  const filtrados=useMemo(()=>produtos.filter((p)=>{const match=`${p.name} ${p.brand||''}`.toLowerCase().includes(busca.toLowerCase());return match&&(!somenteBaixo||Number(p.stock)<=5)}),[produtos,busca,somenteBaixo]);
  async function salvar(product){const stock=Number(draft[product.id]??product.stock);if(!Number.isInteger(stock)||stock<0){toast.error('Informe um estoque inteiro maior ou igual a zero.');return;}try{setSaving(product.id);const {data}=await api.patch(`/products/${product.id}`,{stock});setProdutos((current)=>current.map((p)=>p.id===product.id?data:p));setDraft((current)=>{const next={...current};delete next[product.id];return next});toast.success(`Estoque de ${product.name} atualizado.`);}catch(error){toast.error(error.response?.data?.message||'Não foi possível alterar o estoque.');}finally{setSaving(null)}}
  if(loading)return <LoadingAdmin text="Carregando estoque..."/>;
  const low=produtos.filter((p)=>Number(p.stock)<=5).length;
  return <div><div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">Operação</p><h1 className="mt-1 text-3xl font-black">Estoque</h1><p className="mt-1 text-sm text-zinc-500">Reposição rápida sem abrir o cadastro completo de cada produto.</p></div><ErrorBox message={erro}/>
    <div className="mb-5 grid gap-4 sm:grid-cols-3"><Card label="Produtos" value={produtos.length}/><Card label="Estoque baixo / zerado" value={low} warning/><Card label="Unidades totais" value={produtos.reduce((sum,p)=>sum+Number(p.stock||0),0)}/></div>
    <div className="mb-4 flex flex-wrap gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4"><div className="relative min-w-[240px] flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16}/><input className="admin-input pl-9" placeholder="Produto ou marca..." value={busca} onChange={(e)=>setBusca(e.target.value)}/></div><label className="flex items-center gap-2 rounded-xl border border-zinc-800 px-3 text-sm text-zinc-400"><input type="checkbox" checked={somenteBaixo} onChange={(e)=>setSomenteBaixo(e.target.checked)} className="accent-lime-400"/> Somente críticos</label></div>
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-zinc-900 text-left text-xs uppercase text-zinc-600"><tr><th className="px-4 py-3">Produto</th><th>Categoria</th><th>Atual</th><th className="w-48">Novo estoque</th><th className="px-4 text-right">Salvar</th></tr></thead><tbody>{filtrados.map((p)=><tr key={p.id} className="border-t border-zinc-800"><td className="px-4 py-3"><div className="flex items-center gap-3"><img src={p.image||'https://placehold.co/80x80/18181b/a3e635?text=TG'} alt="" className="h-10 w-10 rounded-lg bg-white object-contain"/><div><p className="font-semibold">{p.name}</p><p className="text-xs text-zinc-600">{p.brand||'Sem marca'}</p></div></div></td><td className="text-zinc-400">{p.category?.name||'-'}</td><td><span className={Number(p.stock)<=5?'font-black text-amber-300':'font-bold'}>{p.stock}</span>{Number(p.stock)<=5&&<TriangleAlert className="ml-2 inline text-amber-300" size={14}/>}</td><td><input type="number" min="0" step="1" className="admin-input py-1.5" value={draft[p.id]??p.stock} onChange={(e)=>setDraft((d)=>({...d,[p.id]:e.target.value}))}/></td><td className="px-4 text-right"><button type="button" disabled={saving===p.id || Number(draft[p.id]??p.stock)===Number(p.stock)} onClick={()=>salvar(p)} className="inline-flex items-center gap-1 rounded-lg bg-lime-400 px-3 py-2 text-xs font-black text-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600"><Check size={14}/> Salvar</button></td></tr>)}</tbody></table></div>{!filtrados.length&&<p className="p-8 text-center text-sm text-zinc-600">Nenhum produto encontrado.</p>}</div>
  </div>;
}
function Card({label,value,warning}) { return <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4"><p className="text-xs text-zinc-600">{label}</p><p className={`mt-1 text-2xl font-black ${warning?'text-amber-300':'text-lime-300'}`}>{value}</p></div>; }
export default Estoque;
