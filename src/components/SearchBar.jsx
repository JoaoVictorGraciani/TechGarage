import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function SearchBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [termo, setTermo] = useState(searchParams.get('busca') || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (termo.trim()) {
      navigate(`/?busca=${encodeURIComponent(termo.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <input
        type="text"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        placeholder="Buscar produtos..."
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-4 pr-10 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 transition-colors"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-lime-400 transition-colors"
        aria-label="Buscar"
      >
        🔍
      </button>
    </form>
  );
}

export default SearchBar;