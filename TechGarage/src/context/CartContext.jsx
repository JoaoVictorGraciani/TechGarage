/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { usuario, carregandoSessao } = useAuth();
  const [carrinho, setCarrinho] = useState([]);
  const [carregandoCarrinho, setCarregandoCarrinho] = useState(false);

  const carregarCarrinho = useCallback(async () => {
    if (!usuario) {
      setCarrinho([]);
      return;
    }

    try {
      setCarregandoCarrinho(true);
      const { data } = await api.get('/cart');

      const itens = data.map((item) => ({
        ...item.product,
        cartId: item.id,
        productId: item.productId,
        quantidade: item.quantity,
      }));

      setCarrinho(itens);
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);

      if (error.response?.status === 401) {
        setCarrinho([]);
      }
    } finally {
      setCarregandoCarrinho(false);
    }
  }, [usuario]);

  useEffect(() => {
    if (!carregandoSessao) {
      // A carga do carrinho sincroniza o estado React com a API após resolver a sessão.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      carregarCarrinho();
    }
  }, [carregandoSessao, carregarCarrinho]);

  const adicionarItem = async (produto, quantidade = 1) => {
    if (!usuario) {
      throw new Error('Faça login para adicionar produtos ao carrinho.');
    }

    try {
      await api.post('/cart/items', {
        productId: produto.id,
        quantity: quantidade,
      });

      await carregarCarrinho();
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Erro ao adicionar produto ao carrinho.',
        { cause: error }
      );
    }
  };

  const removerItem = async (produtoId) => {
    const item = carrinho.find((produto) => produto.id === produtoId);
    if (!item) return;

    try {
      await api.delete(`/cart/items/${item.cartId}`);
      await carregarCarrinho();
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Erro ao remover produto do carrinho.',
        { cause: error }
      );
    }
  };

  const alterarQuantidade = async (produtoId, novaQuantidade) => {
    const item = carrinho.find((produto) => produto.id === produtoId);
    if (!item) return;

    if (novaQuantidade <= 0) {
      await removerItem(produtoId);
      return;
    }

    try {
      await api.patch(`/cart/items/${item.cartId}`, {
        quantity: novaQuantidade,
      });

      await carregarCarrinho();
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Erro ao alterar quantidade.',
        { cause: error }
      );
    }
  };

  const limparCarrinhoLocal = () => setCarrinho([]);

  const totalItens = useMemo(
    () => carrinho.reduce((soma, item) => soma + item.quantidade, 0),
    [carrinho]
  );

  const totalPreco = useMemo(
    () =>
      carrinho.reduce(
        (soma, item) => soma + Number(item.price) * item.quantidade,
        0
      ),
    [carrinho]
  );

  return (
    <CartContext.Provider
      value={{
        carrinho,
        carregandoCarrinho,
        adicionarItem,
        removerItem,
        alterarQuantidade,
        carregarCarrinho,
        limparCarrinhoLocal,
        totalItens,
        totalPreco,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider.');
  }

  return context;
}
