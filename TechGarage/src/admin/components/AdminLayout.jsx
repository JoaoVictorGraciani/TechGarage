import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Boxes, ChartNoAxesCombined, FolderTree, Menu, PackagePlus, ReceiptText, Store, Users, Warehouse, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', end: true, icon: ChartNoAxesCombined },
  { to: '/admin/produtos', label: 'Produtos', icon: Boxes },
  { to: '/admin/produtos/novo', label: 'Novo produto', icon: PackagePlus },
  { to: '/admin/categorias', label: 'Categorias', icon: FolderTree },
  { to: '/admin/estoque', label: 'Estoque', icon: Warehouse },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ReceiptText },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users },
];

function AdminLayout() {
  const [aberto, setAberto] = useState(false);
  const { usuario, logout } = useAuth();
  const fechar = () => setAberto(false);

  return <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
    <button type="button" onClick={() => setAberto(true)} className="fixed left-4 top-4 z-40 rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-white lg:hidden" aria-label="Abrir menu administrativo"><Menu size={20}/></button>
    {aberto && <button type="button" aria-label="Fechar menu" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={fechar}/>} 
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950 transition-transform lg:translate-x-0 ${aberto ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-start justify-between border-b border-zinc-800 p-5"><div><div className="flex items-center gap-2 font-black"><Store className="text-lime-300" size={20}/><span>TechGarage</span><span className="text-lime-300">Admin</span></div><p className="mt-1 text-xs text-zinc-600">Operação & gestão</p></div><button type="button" onClick={fechar} className="text-zinc-400 lg:hidden"><X size={20}/></button></div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">{links.map(({ to,label,end,icon:Icon }) => <NavLink key={to} to={to} end={end} onClick={fechar} className={({isActive}) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive ? 'bg-lime-400 font-bold text-zinc-950' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}><Icon size={17}/>{label}</NavLink>)}</nav>
      <div className="border-t border-zinc-800 p-4"><p className="truncate text-sm font-semibold">{usuario?.name}</p><p className="truncate text-xs text-zinc-600">{usuario?.email}</p><div className="mt-4 flex gap-2"><Link to="/" className="flex-1 rounded-lg border border-zinc-800 px-3 py-2 text-center text-xs hover:border-lime-400/50">Ver loja</Link><button type="button" onClick={logout} className="rounded-lg border border-zinc-800 px-3 py-2 text-xs text-red-300 hover:border-red-500/40">Sair</button></div></div>
    </aside>
    <main className="min-h-screen lg:pl-64"><div className="mx-auto max-w-[1500px] px-4 pb-12 pt-16 sm:px-6 lg:px-8 lg:pt-8"><Outlet/></div></main>
  </div>;
}
export default AdminLayout;
