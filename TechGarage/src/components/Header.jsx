// src/components/Header.jsx

import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import CartBadge from './CartBadge';
import { useAuth } from '../context/AuthContext';

const categorias = [
  { nome: 'Notebooks', slug: 'notebooks' },
  { nome: 'Monitores', slug: 'monitores' },
  { nome: 'Gamer', slug: 'gamer' },
  { nome: 'Smartphones', slug: 'smartphones' },
  { nome: 'Headsets e Áudio', slug: 'headsets-e-audio' },
  { nome: 'Teclados e Mouses', slug: 'teclados-e-mouses' },
  { nome: 'Armazenamento', slug: 'armazenamento' },
  { nome: 'Memória e Componentes', slug: 'memoria-e-componentes' },
];

function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [categoriasAberto, setCategoriasAberto] = useState(false);

  const { usuario, logout } = useAuth();

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickFora(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setCategoriasAberto(false);
      }
    }

    document.addEventListener('mousedown', handleClickFora);

    return () => {
      document.removeEventListener('mousedown', handleClickFora);
    };
  }, []);

  const primeiroNome = usuario?.name
    ? usuario.name.split(' ')[0]
    : 'Usuário';

  return (
    <header className="relative">

      {/* Linha principal */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4">

        {/* Logo + Slogan */}
        <Link to="/" className="shrink-0">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-accent)]">
              TechGarage
            </h1>

            <p className="hidden lg:block text-xs text-[var(--color-text-muted)]">
              Tecnologia de ponta para quem exige performance.
            </p>
          </div>
        </Link>

        {/* Dropdown de categorias desktop */}
        <div
          className="hidden md:block relative"
          ref={dropdownRef}
        >
          <button
            onClick={() =>
              setCategoriasAberto(!categoriasAberto)
            }
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] border border-[var(--color-border)] px-3 py-2 rounded-[var(--radius-sm)] transition-all duration-200 hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
          >
            Categorias

            <span
              className={`text-xs transition-transform duration-200 ${
                categoriasAberto ? 'rotate-180' : ''
              }`}
            >
              ▾
            </span>
          </button>

          <div
            className={`absolute top-full left-0 mt-2 w-56 z-50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-lg shadow-black/30 py-2 origin-top transition-all duration-200 ${
              categoriasAberto
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            {categorias.map((cat) => (
              <Link
                key={cat.slug}
                to={`/?categoria=${cat.slug}`}
                onClick={() => setCategoriasAberto(false)}
                className="block px-4 py-2 text-sm text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-accent)]"
              >
                {cat.nome}
              </Link>
            ))}
          </div>
        </div>

        {/* Espaçador */}
        <div className="flex-1" />

        {/* Usuário + Carrinho + Menu */}
        <div className="flex items-center gap-3 shrink-0">

          {usuario ? (
            <button
              onClick={logout}
              className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--color-text-primary)] border border-[var(--color-border-hover)] px-3 py-1.5 rounded-[var(--radius-full)] transition-all duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] active:scale-95"
              title="Clique para sair"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />

              {primeiroNome}
            </button>

          ) : (

            <Link
              to="/login"
              className="hidden sm:block text-sm font-medium text-[var(--color-accent-contrast)] bg-[var(--color-accent)] px-4 py-1.5 rounded-[var(--radius-full)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-95"
            >
              Entrar
            </Link>
          )}

          {/* Carrinho */}
          <Link
            to="/carrinho"
            className="relative text-[var(--color-text-primary)] transition-transform duration-200 hover:text-[var(--color-accent)] hover:scale-110 active:scale-95"
          >
            🛒
            <CartBadge />
          </Link>

          {/* Hambúrguer mobile */}
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="md:hidden text-[var(--color-text-primary)] transition-colors duration-200 hover:text-[var(--color-accent)]"
            aria-label="Abrir menu"
          >
            {menuAberto ? '✕' : '☰'}
          </button>

        </div>
      </div>

      {/* Linha de busca */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-3">
        <SearchBar />
      </div>

      {/* Menu mobile */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-[var(--color-bg)]/95 backdrop-blur-md border-b border-[var(--color-border)] flex flex-col p-4 gap-3 origin-top transition-all duration-200 ${
          menuAberto
            ? 'opacity-100 scale-y-100'
            : 'opacity-0 scale-y-95 pointer-events-none'
        }`}
      >

        {usuario ? (
          <button
            onClick={() => {
              logout();
              setMenuAberto(false);
            }}
            className="text-left text-sm font-medium text-[var(--color-accent)]"
          >
            Sair ({primeiroNome})
          </button>
        ) : (
          <Link
            to="/login"
            onClick={() => setMenuAberto(false)}
            className="text-sm font-medium text-[var(--color-accent)]"
          >
            Entrar / Cadastrar
          </Link>
        )}

        {categorias.map((cat) => (
          <Link
            key={cat.slug}
            to={`/?categoria=${cat.slug}`}
            onClick={() => setMenuAberto(false)}
            className="text-sm text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--color-accent)]"
          >
            {cat.nome}
          </Link>
        ))}

      </div>

    </header>
  );
}

export default Header;