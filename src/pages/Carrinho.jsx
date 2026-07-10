// src/pages/Carrinho.jsx
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Carrinho() {
  const { carrinho, alterarQuantidade, removerItem, totalPreco } = useCart();

  if (carrinho.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center py-20">
        <p className="text-[var(--color-text-secondary)] mb-4">Seu carrinho está vazio.</p>
        <Link
          to="/"
          className="inline-block bg-[var(--color-accent)] text-[var(--color-accent-contrast)] font-semibold px-5 py-2 rounded-[var(--radius-sm)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-95"
        >
          Continuar comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">Seu Carrinho</h1>

      <div className="flex flex-col gap-3">
        {carrinho.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-3 transition-colors duration-200 hover:border-[var(--color-border-hover)]"
          >
            <img
              src={item.imagem}
              alt={item.nome}
              className="w-16 h-16 object-cover rounded-[var(--radius-sm)] bg-[var(--color-surface-hover)]"
            />

            <div className="flex-1 min-w-0">
              <h3 className="text-sm text-[var(--color-text-primary)] font-medium truncate">{item.nome}</h3>
              <p className="text-[var(--color-accent)] text-sm font-bold">
                {item.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>

            {/* Controle de quantidade */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}
                className="w-7 h-7 flex items-center justify-center bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] rounded-[var(--radius-sm)] transition-all duration-150 hover:bg-[var(--color-border-hover)] active:scale-90"
              >
                -
              </button>
              <span className="w-6 text-center text-[var(--color-text-primary)] text-sm">{item.quantidade}</span>
              <button
                onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}
                className="w-7 h-7 flex items-center justify-center bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] rounded-[var(--radius-sm)] transition-all duration-150 hover:bg-[var(--color-border-hover)] active:scale-90"
              >
                +
              </button>
            </div>

            {/* Subtotal do item */}
            <span className="text-sm text-[var(--color-text-secondary)] w-20 text-right hidden sm:block">
              {(item.preco * item.quantidade).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </span>

            <button
              onClick={() => removerItem(item.id)}
              className="text-[var(--color-text-muted)] transition-all duration-150 hover:text-[var(--color-danger)] hover:scale-110 text-sm"
              aria-label="Remover item"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Resumo / total */}
      <div className="mt-6 bg-[var(--color-surface)] border border-[var(--color-accent)]/30 rounded-[var(--radius-md)] p-4 flex items-center justify-between">
        <span className="text-[var(--color-text-secondary)]">Total</span>
        <span className="text-[var(--color-accent)] text-xl font-bold">
          {totalPreco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>

      <Link
        to="/checkout"
        className="mt-4 block text-center bg-[var(--color-accent)] text-[var(--color-accent-contrast)] font-semibold py-3 rounded-[var(--radius-sm)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-95"
      >
        Finalizar compra
      </Link>
    </div>
  );
}

export default Carrinho;