// src/pages/ProdutoDetalhe.jsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import Loading from '../components/Loading';

function ProdutoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adicionarItem } = useCart();

  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${id}`);
        setProduto(data);
      } catch (err) {
        setErro('Produto não encontrado.');
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [id]);

  if (loading) return <Loading />;

  if (erro || !produto) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center py-20">
        <p className="text-[var(--color-text-secondary)] mb-4">{erro || 'Produto não encontrado.'}</p>
        <Link
          to="/"
          className="inline-block bg-[var(--color-accent)] text-[var(--color-accent-contrast)] font-semibold px-5 py-2 rounded-[var(--radius-sm)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-95"
        >
          Voltar à loja
        </Link>
      </div>
    );
  }

  const semEstoque = produto.stock === 0;

  const handleAdicionar = () => {
    for (let i = 0; i < quantidade; i++) {
      adicionarItem(produto);
    }
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      {/* Trilha de navegação */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-zinc-600 hover:text-[var(--color-accent)] transition-colors mb-6"
      >
        ← Voltar
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Imagem */}
        <div className="aspect-square bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
          <img
            src={produto.image}
            alt={produto.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Informações */}
        <div className="flex flex-col">
          <span className="text-xs uppercase text-[var(--color-text-muted)] tracking-wide mb-2">
            {produto.category?.name || 'Outros'}
          </span>

          <h1 className="text-2xl font-bold text-zinc-900 mb-3">
            {produto.name}
          </h1>

          <span
            className={`self-start text-xs font-semibold px-2 py-1 rounded-[var(--radius-full)] mb-4 ${
              semEstoque
                ? 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
                : produto.stock <= 5
                ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
                : 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
            }`}
          >
            {semEstoque ? 'Sem estoque' : produto.stock <= 5 ? `Últimas ${produto.stock} unidades` : 'Em estoque'}
          </span>

          <p className="text-3xl font-bold text-[var(--color-accent)] mb-6">
            {Number(produto.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>

          {produto.description && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-zinc-900 mb-2">Descrição</h2>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {produto.description}
              </p>
            </div>
          )}

          {!semEstoque && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs uppercase text-zinc-500 tracking-wide mb-2"></span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] rounded-[var(--radius-sm)] transition-all duration-150 hover:bg-[var(--color-border-hover)] active:scale-90"
                >
                  -
                </button>
                <span className="w-8 text-center text-zinc-900">{quantidade}</span>
                <button
                  onClick={() => setQuantidade((q) => Math.min(produto.stock, q + 1))}
                  className="w-8 h-8 flex items-center justify-center bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] rounded-[var(--radius-sm)] transition-all duration-150 hover:bg-[var(--color-border-hover)] active:scale-90"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleAdicionar}
            disabled={semEstoque}
            className={`w-full py-3 rounded-[var(--radius-sm)] font-semibold transition-all duration-200 ${
              semEstoque
                ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] cursor-not-allowed'
                : adicionado
                ? 'bg-[var(--color-success)] text-[var(--color-accent-contrast)]'
                : 'bg-[var(--color-accent)] text-[var(--color-accent-contrast)] hover:bg-[var(--color-accent-hover)] active:scale-95'
            }`}
          >
            {semEstoque ? 'Indisponível' : adicionado ? 'Adicionado! ✓' : 'Adicionar ao carrinho'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProdutoDetalhe;