import { useSearchParams } from 'react-router-dom';
import { useProdutos } from '../hooks/useProdutos';
import ProductGrid from '../components/ProductGrid';
import Loading from '../components/Loading';
import { slugify } from '../utils/slugify';

function Home() {
  const { produtos, categorias, loading, erro } = useProdutos();
  const [searchParams] = useSearchParams();
  const termoBusca = searchParams.get('busca')?.toLowerCase() || '';
  const categoriaSlug = searchParams.get('categoria') || '';
  console.log('slug da URL:', categoriaSlug);
  console.log('categorias da API:', categorias.map(c => ({ nome: c.nome, slugGerado: slugify(c.nome) })));

  if (loading) return <Loading />;
  if (erro) return <p className="text-center text-red-400 py-12">{erro}</p>;

  let produtosFiltrados = produtos;

  // Filtro por categoria
  let nomeCategoriaAtiva = '';
  if (categoriaSlug) {
    const categoriaEncontrada = categorias.find((c) => slugify(c.nome) === categoriaSlug);
    if (categoriaEncontrada) {
      nomeCategoriaAtiva = categoriaEncontrada.nome;
      produtosFiltrados = produtosFiltrados.filter(
        (p) => String(p.categoria_id) === String(categoriaEncontrada.id)
      );
    }
  }

  // Filtro por busca (aplicado em cima do filtro de categoria)
  if (termoBusca) {
    produtosFiltrados = produtosFiltrados.filter((p) =>
      p.nome.toLowerCase().includes(termoBusca)
    );
  }

  return (
    <main className="max-w-7xl mx-auto">
      {nomeCategoriaAtiva && (
        <h2 className="text-lg font-semibold text-white px-4 pt-4">
          {nomeCategoriaAtiva}
        </h2>
      )}

      {produtosFiltrados.length === 0 ? (
        <p className="text-center text-zinc-400 py-16">
          {termoBusca
            ? `Nenhum produto encontrado para "${termoBusca}".`
            : 'Nenhum produto encontrado nesta categoria.'}
        </p>
      ) : (
        <ProductGrid produtos={produtosFiltrados} categorias={categorias} />
      )}
    </main>
  );
}

export default Home;