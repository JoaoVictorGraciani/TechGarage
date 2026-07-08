import ProductCard from "./ProductCard";

function ProductGrid({ produtos }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {produtos.map((produto) => (
        <ProductCard
          key={produto.id}
          produto={produto}
        />
      ))}
    </div>
  );
}

export default ProductGrid;