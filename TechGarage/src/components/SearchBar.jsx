import { Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function SearchBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [termo, setTermo] = useState(searchParams.get('busca') || '');
  const handleSubmit = (e) => { e.preventDefault(); const value=termo.trim(); navigate(value ? `/?busca=${encodeURIComponent(value)}` : '/'); };
  return <form onSubmit={handleSubmit} className="relative w-full"><input type="search" value={termo} onChange={(e)=>setTermo(e.target.value)} placeholder="Buscar produto, marca ou componente..." className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 pl-4 pr-11 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime-400/70"/><button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-lime-300" aria-label="Buscar"><Search size={17}/></button></form>;
}
export default SearchBar;
