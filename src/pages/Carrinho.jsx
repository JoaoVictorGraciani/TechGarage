// src/pages/Carrinho.jsx
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Carrinho() {
  const { carrinho, alterarQuantidade, removerItem, totalPreco } = useCart();

  if (carrinho.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center py-20">
        <p className="text-zinc-400 mb-4">Seu carrinho está vazio.</p>
        <Link
          to="/"
          className="inline-block bg-lime-400 text-zinc-950 font-semibold px-5 py-2 rounded-lg hover:bg-lime-300 transition-colors"
        >
          Continuar comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-xl font-bold text-white mb-6">Seu Carrinho</h1>

      <div className="flex flex-col gap-3">
        {carrinho.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-3"
          >
            <img
              src={item.imagem}
              alt={item.nome}
              className="w-16 h-16 object-cover rounded-lg bg-zinc-800"
            />

            <div className="flex-1 min-w-0">
              <h3 className="text-sm text-white font-medium truncate">{item.nome}</h3>
              <p className="text-lime-400 text-sm font-bold">
                {item.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>

            {/* Controle de quantidade */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}
                className="w-7 h-7 flex items-center justify-center bg-zinc-800 text-white rounded hover:bg-zinc-700"
              >
                -
              </button>
              <span className="w-6 text-center text-white text-sm">{item.quantidade}</span>
              <button
                onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}
                className="w-7 h-7 flex items-center justify-center bg-zinc-800 text-white rounded hover:bg-zinc-700"
              >
                +
              </button>
            </div>

            {/* Subtotal do item */}
            <span className="text-sm text-zinc-300 w-20 text-right hidden sm:block">
              {(item.preco * item.quantidade).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </span>

            <button
              onClick={() => removerItem(item.id)}
              className="text-zinc-500 hover:text-red-400 transition-colors text-sm"
              aria-label="Remover item"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Resumo / total */}
      <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
        <span className="text-zinc-300">Total</span>
        <span className="text-lime-400 text-xl font-bold">
          {totalPreco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>

      <Link
        to="/checkout"
        className="mt-4 block text-center bg-lime-400 text-zinc-950 font-semibold py-3 rounded-lg hover:bg-lime-300 transition-colors"
      >
        Finalizar compra
      </Link>
    </div>
  );
}

export default Carrinho;