import ProductCard from './ProductCard';
import Reveal from './Reveal';

function ProductGrid({ produtos, categorias }) {
  if (produtos.length === 0) {
    return (
      <p className="text-center text-[var(--color-text-secondary)] py-12">
        Nenhum produto encontrado.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 p-4 md:p-6 max-w-7xl mx-auto">
      {produtos.map((produto, index) => {
        const categoria = categorias.find((c) => String(c.id) === String(produto.categoria_id));
        return (
          <Reveal key={produto.id} delay={(index % 8) * 50}>
            <ProductCard
              produto={produto}
              nomeCategoria={categoria?.nome || 'Outros'}
            />
          </Reveal>
        );
      })}
    </div>
  );
}

export default ProductGrid;