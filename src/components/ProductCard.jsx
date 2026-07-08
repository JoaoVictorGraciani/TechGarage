function ProductCard({ produto }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300">

      <img
        src={produto.imagem}
        alt={produto.nome}
        className="w-full h-56 object-cover"
      />

      <div className="p-4">

        <h2 className="text-lg font-semibold mb-2">
          {produto.nome}
        </h2>

        <p className="text-2xl font-bold text-blue-600">
          R$ {Number(produto.preco).toFixed(2)}
        </p>

        <button
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
        >
          Adicionar ao carrinho
        </button>

      </div>

    </div>
  );
}

export default ProductCard;