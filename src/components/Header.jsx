import { ShoppingCart, Search } from "lucide-react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="bg-blue-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">

        <Link
          to="/"
          className="text-2xl font-bold hover:text-gray-200 transition"
        >
          TechStore
        </Link>

        <div className="flex-1 max-w-xl relative">
          <input
            type="text"
            placeholder="Buscar produtos..."
            className="w-full rounded-lg py-2 pl-4 pr-12 text-black outline-none"
          />

          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            size={20}
          />
        </div>

        <Link
          to="/carrinho"
          className="relative hover:scale-110 transition"
        >
          <ShoppingCart size={30} />

          <span className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            0
          </span>
        </Link>

      </div>
    </header>
  );
}

export default Header;