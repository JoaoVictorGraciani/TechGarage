import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [carrinho, setCarrinho] = useState([]);

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
  };

  const totalItens = carrinho.reduce((soma, item) => soma + item.quantidade, 0);

  return (
    <CartContext.Provider value={{ carrinho,
        setCarrinho,       
        adicionarItem,
        removerItem,
        alterarQuantidade,
        totalItens,
        totalPreco, }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}