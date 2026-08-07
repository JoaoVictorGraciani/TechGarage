// src/pages/Checkout.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

function gerarCodigoPix() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  let codigo = '00020126580014BR.GOV.BCB.PIX';

  for (let i = 0; i < 40; i++) {
    codigo += chars[Math.floor(Math.random() * chars.length)];
  }

  return codigo;
}

function Checkout() {
  const {
    carrinho,
    totalPreco,
    setCarrinho,
    userId
  } = useCart();

  const [pixGerado, setPixGerado] = useState(false);
  const [codigoPix] = useState(gerarCodigoPix());
  const [copiado, setCopiado] = useState(false);
  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');

  if (carrinho.length === 0 && !pagamentoConfirmado) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--color-text-secondary)] mb-4">
          Seu carrinho está vazio.
        </p>

        <Link
          to="/"
          className="text-[var(--color-accent)]"
        >
          Continuar comprando
        </Link>
      </div>
    );
  }

  const copiarCodigo = () => {
    navigator.clipboard.writeText(codigoPix);

    setCopiado(true);

    setTimeout(() => {
      setCopiado(false);
    }, 2000);
  };

  const confirmarPagamento = async () => {
    try {
      setProcessando(true);
      setErro('');

      const items = carrinho.map((item) => ({
        productId: item.id,
        quantity: item.quantidade
      }));

      // Criar pedido
      const respostaPedido = await api.post('/orders', {
        userId,
        items
      });

      const pedido = respostaPedido.data;

      // Criar pagamento
      await api.post('/payments', {
        orderId: pedido.id,
        type: 'PIX',
        pixCode: codigoPix,
        status: 'APPROVED'
      });

      // Atualizar status do pedido
      await api.put(`/orders/${pedido.id}`, {
        status: 'PAID'
      });

      // Limpar carrinho no front
      setCarrinho([]);

      setPagamentoConfirmado(true);

    } catch (error) {
      console.error('Erro ao finalizar compra:', error);

      setErro(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Erro ao finalizar a compra.'
      );

    } finally {
      setProcessando(false);
    }
  };

  if (pagamentoConfirmado) {
    return (
      <div className="text-center py-16">

        <div className="text-5xl mb-4">
          ✅
        </div>

        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          Pagamento confirmado!
        </h1>

        <p className="text-[var(--color-text-secondary)] mb-6">
          Seu pedido foi realizado com sucesso.
        </p>

        <Link
          to="/"
          className="text-[var(--color-accent)] font-semibold"
        >
          Voltar à loja
        </Link>

      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">

      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
        Checkout
      </h1>

      {/* Resumo do pedido */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 mb-6">

        <h2 className="text-sm text-[var(--color-text-secondary)] mb-3">
          Resumo do pedido
        </h2>

        <div className="flex flex-col gap-2 mb-3">

          {carrinho.map((item) => (
            <div
              key={item.id}
              className="flex justify-between text-sm"
            >

              <span className="text-[var(--color-text-secondary)] truncate pr-2">
                {item.name}

                <span className="text-[var(--color-text-muted)]">
                  {' '}x{item.quantidade}
                </span>
              </span>

              <span className="text-[var(--color-text-secondary)] shrink-0">
                {(Number(item.price) * item.quantidade).toLocaleString(
                  'pt-BR',
                  {
                    style: 'currency',
                    currency: 'BRL'
                  }
                )}
              </span>

            </div>
          ))}

        </div>

        <div className="border-t border-[var(--color-border)] pt-3 flex justify-between items-center">

          <span className="text-[var(--color-text-primary)] font-medium">
            Total
          </span>

          <span className="text-[var(--color-accent)] text-xl font-bold">
            {totalPreco.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </span>

        </div>

      </div>

      {/* Erro */}
      {erro && (
        <p className="text-[var(--color-danger)] text-sm mb-4 text-center">
          {erro}
        </p>
      )}

      {/* PIX */}
      {!pixGerado ? (

        <button
          onClick={() => setPixGerado(true)}
          className="w-full bg-[var(--color-accent)] text-[var(--color-accent-contrast)] font-semibold py-3 rounded-[var(--radius-sm)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-95"
        >
          Pagar com PIX
        </button>

      ) : (

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 flex flex-col items-center gap-4">

          <h2 className="text-sm text-[var(--color-text-secondary)] self-start">
            Escaneie o QR Code
          </h2>

          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&bgcolor=18181b&color=a3e635&data=${encodeURIComponent(codigoPix)}`}
            alt="QR Code PIX"
            className="w-48 h-48 rounded-[var(--radius-md)] border border-[var(--color-border)]"
          />

          <div className="w-full">

            <span className="text-xs text-[var(--color-text-muted)] block mb-1">
              PIX Copia e Cola
            </span>

            <div className="flex items-center gap-2">

              <input
                readOnly
                value={codigoPix}
                className="flex-1 bg-[var(--color-surface-hover)] border border-[var(--color-border-hover)] rounded-[var(--radius-sm)] px-3 py-2 text-xs text-[var(--color-text-secondary)] truncate"
              />

              <button
                onClick={copiarCodigo}
                className="shrink-0 border rounded-[var(--radius-sm)] text-xs font-medium px-3 py-2"
              >
                {copiado ? 'Copiado!' : 'Copiar'}
              </button>

            </div>

          </div>

          <button
            onClick={confirmarPagamento}
            disabled={processando}
            className="w-full bg-[var(--color-accent)] text-[var(--color-accent-contrast)] font-semibold py-3 rounded-[var(--radius-sm)] mt-2 disabled:opacity-50"
          >
            {processando
              ? 'Processando...'
              : 'Simular pagamento aprovado'}
          </button>

        </div>

      )}

    </div>
  );
}

export default Checkout;