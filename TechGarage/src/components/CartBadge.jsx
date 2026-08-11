import { useCart } from '../context/CartContext';

function CartBadge() {
  const { totalItens } = useCart();

  if (totalItens === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 bg-lime-400 text-zinc-950 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
      {totalItens > 9 ? '9+' : totalItens}
    </span>
  );
}

export default CartBadge;