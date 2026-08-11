// src/context/CartContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { usuario } = useAuth();

  const [carrinho, setCarrinho] = useState([]);

  const carregarCarrinho = async () => {
    if (!usuario) {
      setCarrinho([]);
      return;
    }

    try {
      const resposta = await api.get(`/cart/${usuario.id}`);

      const itens = resposta.data.map((item) => ({
        ...item.product,
        cartId: item.id,
        productId: item.productId,
        quantidade: item.quantity,
      }));

      setCarrinho(itens);

    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    }
  };

  useEffect(() => {
    carregarCarrinho();
  }, [usuario]);


  const adicionarItem = async (produto) => {
    if (!usuario) {
      throw new Error('Faça login para adicionar produtos ao carrinho.');
    }

    try {
      await api.post('/cart/add', {
        userId: usuario.id,
        productId: produto.id,
        quantity: 1,
      });

      await carregarCarrinho();

    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      throw error;
    }
  };


  const removerItem = async (produtoId) => {
    if (!usuario) return;

    try {
      const item = carrinho.find(
        (item) => item.id === produtoId
      );

      if (!item) return;

      await api.delete(`/cart/remove/${item.cartId}`);

      await carregarCarrinho();

    } catch (error) {
      console.error('Erro ao remover produto:', error);
    }
  };


  const alterarQuantidade = async (produtoId, novaQuantidade) => {
    if (!usuario) return;

    try {
      const item = carrinho.find(
        (item) => item.id === produtoId
      );

      if (!item) return;

      if (novaQuantidade <= 0) {
        await removerItem(produtoId);
        return;
      }

      await api.put(`/cart/${item.cartId}`, {
        quantity: novaQuantidade,
      });

      await carregarCarrinho();

    } catch (error) {
      console.error('Erro ao alterar quantidade:', error);
    }
  };


  const totalItens = carrinho.reduce(
    (soma, item) => soma + item.quantidade,
    0
  );


  const totalPreco = carrinho.reduce(
    (soma, item) =>
      soma + Number(item.price) * item.quantidade,
    0
  );


  return (
    <CartContext.Provider
      value={{
        carrinho,
        setCarrinho,
        adicionarItem,
        removerItem,
        alterarQuantidade,
        totalItens,
        totalPreco,
        userId: usuario?.id || null,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}


export function useCart() {
  return useContext(CartContext);
}