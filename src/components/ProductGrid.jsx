import ProductCard from './ProductCard';

function ProductGrid({ produtos, categorias }) {
  if (produtos.length === 0) {
    return (
      <p className="text-center text-zinc-400 py-12">
        Nenhum produto encontrado.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {produtos.map((produto) => {
        const categoria = categorias.find((c) => c.id === produto.categoria_id);
        return (
          <ProductCard
            key={produto.id}
            produto={produto}
            nomeCategoria={categoria?.nome || 'Outros'}
          />
        );
      })}
    </div>
  );
}

export default ProductGrid;