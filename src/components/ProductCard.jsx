import { useCart } from '../context/CartContext';

function ProductCard({ produto, nomeCategoria }) {
  const { adicionarItem } = useCart();

  const semEstoque = produto.estoque === 0;

  return (
    <div className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden flex flex-col transition-all duration-300 hover:border-[var(--color-accent)]/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/30">
      {/* Imagem */}
      <div className="relative aspect-square bg-[var(--color-surface-hover)] overflow-hidden">
        <img
          src={produto.imagem}
          alt={produto.nome}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badge de estoque */}
        <span
          className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-1 rounded-[var(--radius-full)] ${
            semEstoque
              ? 'bg-[var(--color-danger)]/90 text-white'
              : produto.estoque <= 3
              ? 'bg-[var(--color-warning)]/90 text-[var(--color-accent-contrast)]'
              : 'bg-[var(--color-accent)]/90 text-[var(--color-accent-contrast)]'
          }`}
        >
          {semEstoque ? 'Sem estoque' : produto.estoque <= 3 ? `Últimas ${produto.estoque}` : 'Em estoque'}
        </span>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col gap-1 p-[var(--space-sm)] flex-1">
        <span className="text-[10px] uppercase text-[var(--color-text-muted)] tracking-wide">
          {nomeCategoria}
        </span>
        <h3 className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2">
          {produto.nome}
        </h3>

        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-[var(--color-accent)] font-bold text-base">
            {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>

        <button
          onClick={() => adicionarItem(produto)}
          disabled={semEstoque}
          className={`mt-2 w-full py-2 rounded-[var(--radius-sm)] text-sm font-semibold transition-all duration-200 ${
            semEstoque
              ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] cursor-not-allowed'
              : 'bg-[var(--color-accent)] text-[var(--color-accent-contrast)] hover:bg-[var(--color-accent-hover)] active:scale-95'
          }`}
        >
          {semEstoque ? 'Indisponível' : 'Adicionar ao carrinho'}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;