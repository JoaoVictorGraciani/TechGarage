import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function ProductCard({ produto, nomeCategoria }) {
  const { adicionarItem } = useCart();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const semEstoque = produto.stock === 0;

  const handleAdicionar = async () => {
    if (!usuario) {
      navigate('/login');
      return;
    }

    try {
      await adicionarItem(produto);
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
    }
  };

  return (
    <div className="relative flex flex-col bg-[var(--color-surface)] rounded-[var(--radius-md)] overflow-hidden">

      {/* Imagem */}
      <div className="relative">
        <img
          src={produto.image}
          alt={produto.name}
          className="w-full h-40 object-cover"
        />

        {/* Badge de estoque */}
        <span
          className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-1 rounded-[var(--radius-full)] ${
            semEstoque
              ? 'bg-[var(--color-danger)]/90 text-white'
              : produto.stock <= 3
              ? 'bg-[var(--color-warning)]/90 text-[var(--color-accent-contrast)]'
              : 'bg-[var(--color-accent)]/90 text-[var(--color-accent-contrast)]'
          }`}
        >
          {semEstoque
            ? 'Sem estoque'
            : produto.stock <= 3
            ? `Últimas ${produto.stock}`
            : 'Em estoque'}
        </span>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col gap-1 p-[var(--space-sm)] flex-1">
        <span className="text-[10px] uppercase text-[var(--color-text-muted)] tracking-wide">
          {nomeCategoria}
        </span>

        <h3 className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2">
          {produto.name}
        </h3>

        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-[var(--color-accent)] font-bold text-base">
            {Number(produto.price).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
        </div>

        <button
          onClick={handleAdicionar}
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