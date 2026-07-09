// src/pages/Checkout.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function gerarCodigoPix() {
  // Simulação de um código "copia e cola" PIX
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '00020126580014BR.GOV.BCB.PIX';
  for (let i = 0; i < 40; i++) {
    codigo += chars[Math.floor(Math.random() * chars.length)];
  }
  return codigo;
}

function Checkout() {
  const { carrinho, totalPreco, setCarrinho } = useCart();
  const navigate = useNavigate();

  const [pixGerado, setPixGerado] = useState(false);
  const [codigoPix] = useState(gerarCodigoPix());
  const [copiado, setCopiado] = useState(false);
  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);

  if (carrinho.length === 0 && !pagamentoConfirmado) {
    return (
      <div className="max-w-md mx-auto p-6 text-center py-20">
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

  const copiarCodigo = () => {
    navigator.clipboard.writeText(codigoPix);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const confirmarPagamento = () => {
    setPagamentoConfirmado(true);
    setCarrinho([]);
  };

  if (pagamentoConfirmado) {
    return (
      <div className="max-w-md mx-auto p-6 text-center py-20">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-xl font-bold text-white mb-2">Pagamento confirmado!</h1>
        <p className="text-zinc-400 mb-6">Seu pedido foi realizado com sucesso.</p>
        <Link
          to="/"
          className="inline-block bg-lime-400 text-zinc-950 font-semibold px-5 py-2 rounded-lg hover:bg-lime-300 transition-colors"
        >
          Voltar à loja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 md:p-6">
      <h1 className="text-xl font-bold text-white mb-6">Checkout</h1>

      {/* Resumo dos valores */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <h2 className="text-sm text-zinc-400 mb-3">Resumo do pedido</h2>
        <div className="flex flex-col gap-2 mb-3">
          {carrinho.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-zinc-300 truncate pr-2">
                {item.nome} <span className="text-zinc-500">x{item.quantidade}</span>
              </span>
              <span className="text-zinc-300 shrink-0">
                {(item.preco * item.quantidade).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-zinc-800 pt-3 flex justify-between items-center">
          <span className="text-zinc-300 font-medium">Total</span>
          <span className="text-lime-400 text-xl font-bold">
            {totalPreco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </div>

      {/* Pagamento PIX */}
      {!pixGerado ? (
        <button
          onClick={() => setPixGerado(true)}
          className="w-full bg-lime-400 text-zinc-950 font-semibold py-3 rounded-lg hover:bg-lime-300 transition-colors"
        >
          Pagar com PIX
        </button>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center gap-4">
          <h2 className="text-sm text-zinc-400 self-start">Escaneie o QR Code</h2>

          {/* QR Code fake, gerado via API pública de placeholder */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&bgcolor=18181b&color=a3e635&data=${encodeURIComponent(codigoPix)}`}
            alt="QR Code PIX"
            className="w-48 h-48 rounded-lg border border-zinc-800"
          />

          <div className="w-full">
            <span className="text-xs text-zinc-500 block mb-1">PIX Copia e Cola</span>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={codigoPix}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 truncate"
              />
              <button
                onClick={copiarCodigo}
                className="shrink-0 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-medium px-3 py-2 rounded-lg hover:border-lime-400 transition-colors"
              >
                {copiado ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Botão de simulação — em produção, isso viria de um webhook do banco */}
          <button
            onClick={confirmarPagamento}
            className="w-full bg-lime-400 text-zinc-950 font-semibold py-3 rounded-lg hover:bg-lime-300 transition-colors mt-2"
          >
            Simular pagamento aprovado
          </button>
        </div>
      )}
    </div>
  );
}

export default Checkout;