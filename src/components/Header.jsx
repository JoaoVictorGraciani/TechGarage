// src/components/Header.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import CartBadge from './CartBadge';

const categorias = [
  { nome: 'Notebooks', slug: 'notebooks' },
  { nome: 'Monitores', slug: 'monitores' },
  { nome: 'Gamer', slug: 'gamer' },
  { nome: 'Smartphones', slug: 'smartphones' },
  { nome: 'Headsets e Áudio', slug: 'headsets-audio' },
  { nome: 'Teclados e Mouses', slug: 'teclados-mouses' },
  { nome: 'Armazenamento', slug: 'armazenamento' },
  { nome: 'Memória e Componentes', slug: 'memoria-componentes' },
];

function Header() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-zinc-950 border-b border-zinc-800 relative">
      {/* Linha principal: logo, nav desktop, carrinho, hambúrguer */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
        {/* Logo + Slogan */}
        <Link to="/" className="flex flex-col shrink-0 leading-none group">
          <span className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Tech<span className="text-lime-400">Garage</span>
          </span>
          <span className="hidden sm:block text-[10px] md:text-xs text-zinc-400 tracking-wide mt-0.5 group-hover:text-lime-400 transition-colors">
            Tecnologia de ponta para quem exige performance.
          </span>
        </Link>

        {/* Nav desktop + Cart + Hamburguer */}
        <div className="flex items-center gap-4">
          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-5">
            {categorias.map((cat) => (
              <Link
                key={cat.slug}
                to={`/?categoria=${cat.slug}`}
                className="text-sm text-zinc-300 hover:text-lime-400 transition-colors whitespace-nowrap"
              >
                {cat.nome}
              </Link>
            ))}
          </nav>

          {/* Ícone do carrinho */}
          <Link to="/carrinho" className="relative text-zinc-200 hover:text-lime-400 transition-colors">
            🛒
            <CartBadge />
          </Link>

          {/* Botão hambúrguer (só mobile/tablet) */}
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="lg:hidden text-zinc-200 hover:text-lime-400 transition-colors"
            aria-label="Abrir menu"
          >
            {menuAberto ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Linha da busca, abaixo da nav principal */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-3">
        <SearchBar />
      </div>

      {/* Menu mobile (dropdown) */}
      {menuAberto && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-zinc-950 border-b border-zinc-800 flex flex-col p-4 gap-3">
          {categorias.map((cat) => (
            <Link
              key={cat.slug}
              to={`/?categoria=${cat.slug}`}
              onClick={() => setMenuAberto(false)}
              className="text-sm text-zinc-300 hover:text-lime-400 transition-colors"
            >
              {cat.nome}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

export default Header;