import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Menu, PackageSearch, ShieldCheck, UserRound, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import SearchBar from './SearchBar';
import CartBadge from './CartBadge';
import { useAuth } from '../context/AuthContext';
import { slugify } from '../utils/slugify';

function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [categoriasAberto, setCategoriasAberto] = useState(false);
  const [contaAberta, setContaAberta] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const { usuario, logout } = useAuth();
  const dropdownRef = useRef(null);
  const accountRef = useRef(null);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategorias(data)).catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    function outside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setCategoriasAberto(false);
      if (accountRef.current && !accountRef.current.contains(event.target)) setContaAberta(false);
    }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);

  const primeiroNome = usuario?.name?.split(' ')[0] || 'Conta';

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/90 text-white backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
        <Link to="/" className="shrink-0">
          <div className="text-xl font-black tracking-tight">Tech<span className="text-[var(--color-accent)]">Garage</span></div>
          <p className="hidden text-[10px] uppercase tracking-[0.18em] text-zinc-500 xl:block">Performance & tecnologia</p>
        </Link>

        <div ref={dropdownRef} className="relative hidden md:block">
          <button type="button" onClick={() => setCategoriasAberto((v) => !v)} className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-600 hover:text-white">
            Categorias <ChevronDown size={14} className={categoriasAberto ? 'rotate-180' : ''} />
          </button>
          {categoriasAberto && (
            <div className="absolute left-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
              {categorias.map((cat) => (
                <Link key={cat.id} to={`/?categoria=${slugify(cat.name)}`} className="block rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-lime-300">{cat.name}</Link>
              ))}
            </div>
          )}
        </div>

        <div className="hidden flex-1 md:block"><SearchBar /></div>

        <div className="ml-auto flex items-center gap-2">
          <CartBadge />
          {usuario ? (
            <div ref={accountRef} className="relative hidden sm:block">
              <button type="button" onClick={() => setContaAberta((v) => !v)} className="flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-sm hover:border-zinc-600">
                <UserRound size={16} className="text-lime-300" /> {primeiroNome} <ChevronDown size={13} />
              </button>
              {contaAberta && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
                  <p className="px-3 pb-2 pt-1 text-xs text-zinc-500">{usuario.email}</p>
                  <AccountLink to="/perfil" icon={UserRound}>Meu perfil</AccountLink>
                  <AccountLink to="/pedidos" icon={PackageSearch}>Meus pedidos</AccountLink>
                  {usuario.role === 'ADMIN' && <AccountLink to="/admin" icon={ShieldCheck}>Painel Admin</AccountLink>}
                  <button type="button" onClick={logout} className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10"><LogOut size={15}/> Sair</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hidden rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-zinc-950 hover:bg-lime-300 sm:block">Entrar</Link>
          )}
          <button type="button" onClick={() => setMenuAberto((v) => !v)} className="rounded-lg border border-zinc-800 p-2 md:hidden" aria-label="Menu">{menuAberto ? <X size={20}/> : <Menu size={20}/>}</button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-3 md:hidden"><SearchBar /></div>

      {menuAberto && (
        <div className="border-t border-zinc-900 bg-zinc-950 px-4 py-4 md:hidden">
          <div className="grid gap-2">
            <Link to="/" className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900">Loja</Link>
            {usuario ? <>
              <Link to="/perfil" className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900">Meu perfil</Link>
              <Link to="/pedidos" className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900">Meus pedidos</Link>
              {usuario.role === 'ADMIN' && <Link to="/admin" className="rounded-lg px-3 py-2 text-sm text-lime-300 hover:bg-zinc-900">Painel Admin</Link>}
              <button type="button" onClick={logout} className="rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10">Sair</button>
            </> : <Link to="/login" className="rounded-lg bg-lime-400 px-3 py-2 text-center text-sm font-bold text-zinc-950">Entrar</Link>}
          </div>
        </div>
      )}
    </header>
  );
}

function AccountLink({ to, icon: Icon, children }) {
  return <Link to={to} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"><Icon size={15}/>{children}</Link>;
}

export default Header;
