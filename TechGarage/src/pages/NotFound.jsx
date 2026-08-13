import { Link } from 'react-router-dom';
function NotFound() { return <main className="grid min-h-[70vh] place-items-center bg-zinc-950 px-4 text-center text-white"><div><p className="text-6xl font-black text-lime-300">404</p><h1 className="mt-3 text-2xl font-bold">Página não encontrada</h1><p className="mt-2 text-sm text-zinc-500">O endereço acessado não existe na TechGarage.</p><Link to="/" className="mt-6 inline-block rounded-xl bg-lime-400 px-5 py-3 text-sm font-black text-zinc-950">Voltar para a loja</Link></div></main>; }
export default NotFound;
