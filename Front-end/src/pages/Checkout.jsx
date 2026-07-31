// src/pages/Checkout.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function gerarCodigoPix() {
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
        <p className="text-[var(--color-text-secondary)] mb-4">Seu carrinho está vazio.</p>
        <Link
          to="/"
          className="inline-block bg-[var(--color-accent)] text-[var(--color-accent-contrast)] font-semibold px-5 py-2 rounded-[var(--radius-sm)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-95"
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
      <div className="max-w-md mx-auto p-6 text-center py-20 animate-[fadeInUp_0.4s_ease]">
        <div className="text-5xl mb-4 animate-[popIn_0.4s_ease]">✅</div>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Pagamento confirmado!</h1>
        <p className="text-[var(--color-text-secondary)] mb-6">Seu pedido foi realizado com sucesso.</p>
        <Link
          to="/"
          className="inline-block bg-[var(--color-accent)] text-[var(--color-accent-contrast)] font-semibold px-5 py-2 rounded-[var(--radius-sm)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-95"
        >
          Voltar à loja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 md:p-6">
      <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">Checkout</h1>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 mb-6">
        <h2 className="text-sm text-[var(--color-text-secondary)] mb-3">Resumo do pedido</h2>
        <div className="flex flex-col gap-2 mb-3">
          {carrinho.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)] truncate pr-2">
                {item.name} <span className="text-[var(--color-text-muted)]">x{item.quantidade}</span>
              </span>
              <span className="text-[var(--color-text-secondary)] shrink-0">
                {(Number(item.price) * item.quantidade).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-[var(--color-border)] pt-3 flex justify-between items-center">
          <span className="text-[var(--color-text-primary)] font-medium">Total</span>
          <span className="text-[var(--color-accent)] text-xl font-bold">
            {totalPreco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </div>

      {!pixGerado ? (
        <button
          onClick={() => setPixGerado(true)}
          className="w-full bg-[var(--color-accent)] text-[var(--color-accent-contrast)] font-semibold py-3 rounded-[var(--radius-sm)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-95"
        >
          Pagar com PIX
        </button>
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 flex flex-col items-center gap-4 animate-[fadeInUp_0.4s_ease]">
          <h2 className="text-sm text-[var(--color-text-secondary)] self-start">Escaneie o QR Code</h2>

          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&bgcolor=18181b&color=a3e635&data=${encodeURIComponent(codigoPix)}`}
            alt="QR Code PIX"
            className="w-48 h-48 rounded-[var(--radius-md)] border border-[var(--color-border)]"
          />

          <div className="w-full">
            <span className="text-xs text-[var(--color-text-muted)] block mb-1">PIX Copia e Cola</span>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={codigoPix}
                className="flex-1 bg-[var(--color-surface-hover)] border border-[var(--color-border-hover)] rounded-[var(--radius-sm)] px-3 py-2 text-xs text-[var(--color-text-secondary)] truncate"
              />
              <button
                onClick={copiarCodigo}
                className={`shrink-0 border rounded-[var(--radius-sm)] text-xs font-medium px-3 py-2 transition-all duration-200 active:scale-95 ${
                  copiado
                    ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'bg-[var(--color-surface-hover)] border-[var(--color-border-hover)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)]'
                }`}
              >
                {copiado ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          <button
            onClick={confirmarPagamento}
            className="w-full bg-[var(--color-accent)] text-[var(--color-accent-contrast)] font-semibold py-3 rounded-[var(--radius-sm)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-95 mt-2"
          >
            Simular pagamento aprovado
          </button>
        </div>
      )}
    </div>
  );
}

export default Checkout;