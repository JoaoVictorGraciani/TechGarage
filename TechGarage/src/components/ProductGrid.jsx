import ProductCard from './ProductCard';
import Reveal from './Reveal';

function ProductGrid({ produtos, categorias }) {
  if (!produtos.length) return <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 px-6 py-16 text-center text-sm text-zinc-500">Nenhum produto encontrado com esses filtros.</div>;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {produtos.map((produto, index) => {
        const categoria = produto.category || categorias.find((c) => String(c.id) === String(produto.categoryId));
        return <Reveal key={produto.id} delay={(index % 8) * 35}><ProductCard produto={produto} nomeCategoria={categoria?.name || 'Outros'} /></Reveal>;
      })}
    </div>
  );
}
export default ProductGrid;
