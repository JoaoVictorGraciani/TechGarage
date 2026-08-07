// src/pages/MeusPedidos.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';

const statusInfo = {
  PENDING: { label: 'Aguardando pagamento', cor: 'text-[var(--color-warning)] bg-[var(--color-warning)]/10' },
  PAID: { label: 'Pago', cor: 'text-[var(--color-success)] bg-[var(--color-success)]/10' },
  CANCELED: { label: 'Cancelado', cor: 'text-[var(--color-danger)] bg-[var(--color-danger)]/10' },
};

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function MeusPedidos() {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        const { data } = await api.get(`/orders/usuario/${usuario.id}`);
        setPedidos(data);
      } catch (err) {
        setErro('Não foi possível carregar seus pedidos.');
      } finally {
        setLoading(false);
      }
    }
    if (usuario) carregar();
  }, [usuario]);

  if (!usuario) {
    return (
      <div className="max-w-md mx-auto p-6 text-center py-20">
        <p className="text-zinc-600 mb-4">Você precisa estar logado para ver seus pedidos.</p>
        <Link
          to="/login"
          className="inline-block bg-[var(--color-accent)] text-[var(--color-accent-contrast)] font-semibold px-5 py-2 rounded-[var(--radius-sm)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-95"
        >
          Fazer login
        </Link>
      </div>
    );
  }

  if (loading) return <Loading />;
  if (erro) return <p className="text-center text-[var(--color-danger)] py-12">{erro}</p>;

  if (pedidos.length === 0) {
    return (
      <div className="max-w-md mx-auto p-6 text-center py-20">
        <p className="text-zinc-600 mb-4">Você ainda não fez nenhum pedido.</p>
        <Link
          to="/"
          className="inline-block bg-[var(--color-accent)] text-[var(--color-accent-contrast)] font-semibold px-5 py-2 rounded-[var(--radius-sm)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-95"
        >
          Ir às compras
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <h1 className="text-xl font-bold text-zinc-900 mb-6">Meus Pedidos</h1>

      <div className="flex flex-col gap-4">
        {pedidos.map((pedido) => {
          const status = statusInfo[pedido.status] || statusInfo.PENDING;
          return (
            <div
              key={pedido.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4"
            >
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--color-border)]">
                <div>
                  <p className="text-sm text-[var(--color-text-primary)] font-medium">
                    Pedido #{pedido.id}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {formatarData(pedido.createdAt)}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-[var(--radius-full)] ${status.cor}`}>
                  {status.label}
                </span>
              </div>

              <div className="flex flex-col gap-2 mb-3">
                {pedido.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">
                      {item.product?.name || 'Produto removido'} <span className="text-[var(--color-text-muted)]">x{item.quantity}</span>
                    </span>
                    <span className="text-[var(--color-text-secondary)]">
                      {(Number(item.unitPrice) * item.quantity).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[var(--color-border)]">
                <span className="text-sm text-[var(--color-text-secondary)]">Total</span>
                <span className="text-[var(--color-accent)] font-bold">
                  {Number(pedido.totalValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MeusPedidos;