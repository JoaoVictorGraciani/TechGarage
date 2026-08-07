import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext();
const CHAVE_STORAGE = 'techgarage:carrinho';

function carregarCarrinhoInicial() {
  try {
    const dados = localStorage.getItem(CHAVE_STORAGE);
    return dados ? JSON.parse(dados) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [carrinho, setCarrinho] = useState(carregarCarrinhoInicial);
  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(carrinho));
  }, [carrinho]);

  const adicionarItem = (produto) => {
    setCarrinho((prev) => {
      const existe = prev.find((item) => item.id === produto.id);
      if (existe) {
        return prev.map((item) =>
          item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });
    addToast(`${produto.name} adicionado ao carrinho`);
  };

  const removerItem = (produtoId) => {
    setCarrinho((prev) => prev.filter((item) => item.id !== produtoId));
  };

  const alterarQuantidade = (produtoId, novaQuantidade) => {
    if (novaQuantidade <= 0) {
      removerItem(produtoId);
      return;
    }
    setCarrinho((prev) =>
      prev.map((item) =>
        item.id === produtoId ? { ...item, quantidade: novaQuantidade } : item
      )
    );
  };

  const totalItens = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
  const totalPreco = carrinho.reduce((soma, item) => soma + Number(item.price) * item.quantidade, 0);

  return (
    <CartContext.Provider
      value={{ carrinho, setCarrinho, adicionarItem, removerItem, alterarQuantidade, totalItens, totalPreco }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}