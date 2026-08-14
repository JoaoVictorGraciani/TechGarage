import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function CartBadge() {
  const { totalItens } = useCart();
  return (
    <Link to="/carrinho" className="relative grid h-10 w-10 place-items-center rounded-xl border border-zinc-800 text-zinc-300 transition hover:border-zinc-600 hover:text-lime-300" aria-label={`Carrinho com ${totalItens} item(ns)`}>
      <ShoppingCart size={18}/>
      {totalItens > 0 && <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-lime-400 px-1 text-[10px] font-black text-zinc-950">{totalItens > 99 ? '99+' : totalItens}</span>}
    </Link>
  );
}
export default CartBadge;
