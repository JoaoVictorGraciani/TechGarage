import { useCart } from '../context/CartContext';

function ProductCard({ produto, nomeCategoria }) {
  const { adicionarItem } = useCart();

  const semEstoque = produto.estoque === 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col hover:border-lime-400/50 transition-colors">
      {/* Imagem */}
      <div className="relative aspect-square bg-zinc-800">
        <img
          src={produto.imagem}
          alt={produto.nome}
          className="w-full h-full object-cover"
        />
        {/* Badge de estoque */}
        <span
          className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-1 rounded-full ${
            semEstoque
              ? 'bg-red-500/90 text-white'
              : produto.estoque <= 3
              ? 'bg-yellow-500/90 text-zinc-950'
              : 'bg-lime-400/90 text-zinc-950'
          }`}
        >
          {semEstoque ? 'Sem estoque' : produto.estoque <= 3 ? `Últimas ${produto.estoque}` : 'Em estoque'}
        </span>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col gap-1 p-3 flex-1">
        <span className="text-[10px] uppercase text-zinc-500 tracking-wide">
          {nomeCategoria}
        </span>
        <h3 className="text-sm font-medium text-white line-clamp-2">
          {produto.nome}
        </h3>

        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-lime-400 font-bold text-base">
            {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>

        <button
          onClick={() => adicionarItem(produto)}
          disabled={semEstoque}
          className={`mt-2 w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
            semEstoque
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-lime-400 text-zinc-950 hover:bg-lime-300'
          }`}
        >
          {semEstoque ? 'Indisponível' : 'Adicionar ao carrinho'}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;