// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/produtos', label: 'Produtos' },
  { to: '/categorias', label: 'Categorias' },
  { to: '/usuarios', label: 'Usuários' },
];

function Sidebar() {
  return (
    <aside className="w-56 shrink-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] min-h-screen p-4">
      <h1 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">
        TechGarage <span className="text-[var(--color-accent)]">Admin</span>
      </h1>
      <p className="text-xs text-[var(--color-text-muted)] mb-6">Painel de gerenciamento</p>

      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `px-3 py-2 rounded-[var(--radius-sm)] text-sm transition-colors duration-150 ${
                isActive
                  ? 'bg-[var(--color-accent)] text-[var(--color-accent-contrast)] font-semibold'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;