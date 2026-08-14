import { ExternalLink, Image as ImageIcon, Loader2, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

export default function SerperImagePicker({ productName = '', brand = '', onSelect }) {
  const defaultQuery = useMemo(
    () => [brand, productName].filter(Boolean).join(' ').trim(),
    [brand, productName]
  );

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(defaultQuery);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cached, setCached] = useState(false);

  useEffect(() => {
    if (!open) setQuery(defaultQuery);
  }, [defaultQuery, open]);

  async function search() {
    const q = query.trim();
    if (q.length < 2) {
      setError('Digite pelo menos 2 caracteres.');
      return;
    }

    setLoading(true);
    setError('');
    setImages([]);
    setCached(false);

    try {
      const { data } = await api.get('/serper/images', {
        params: { q, limit: 24 },
      });
      setImages(data.images || []);
      setCached(Boolean(data.cached));
      if (!data.images?.length) setError('Nenhuma imagem encontrada para essa pesquisa.');
    } catch (err) {
      setImages([]);
      setError(err.response?.data?.message || 'Não foi possível pesquisar imagens na Serper.');
    } finally {
      setLoading(false);
    }
  }

  function choose(url) {
    onSelect(url);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-400/10 px-3.5 py-2 text-sm font-bold text-blue-300 transition hover:border-blue-300/60 hover:bg-blue-400/15"
      >
        <ImageIcon size={16} /> Buscar imagens no Google
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}
        >
          <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 p-4 sm:p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">Serper · Google Images</p>
                <h2 className="mt-1 text-xl font-black">Escolher imagem do produto</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-2 border-b border-zinc-800 p-4 sm:p-5">
              <input
                className="admin-input flex-1"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ex.: Acer Nitro V15 ANV15-51"
                autoFocus
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    search();
                  }
                }}
              />
              <button
                type="button"
                onClick={search}
                disabled={loading}
                className="inline-flex min-w-28 items-center justify-center gap-2 rounded-xl bg-blue-400 px-4 font-black text-zinc-950 disabled:opacity-50"
              >
                {loading ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
                Pesquisar
              </button>
            </div>

            {error && (
              <div className="mx-4 mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 sm:mx-5">
                {error}
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  {images.length ? `${images.length} imagens encontradas` : 'Resultados'}
                </p>
                {cached && <span className="text-xs text-emerald-400">resultado em cache · sem nova consulta</span>}
              </div>

              {loading && (
                <div className="flex items-center justify-center gap-2 py-24 text-sm text-zinc-500">
                  <Loader2 size={18} className="animate-spin" /> Pesquisando no Google Images...
                </div>
              )}

              {!loading && !images.length && !error && (
                <p className="py-24 text-center text-sm text-zinc-600">
                  Pesquise pelo nome completo, marca ou modelo do produto para obter resultados mais precisos.
                </p>
              )}

              {!loading && images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {images.map((image) => (
                    <div
                      key={`${image.id}-${image.imageUrl}`}
                      className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 transition hover:border-blue-400/60"
                    >
                      <button
                        type="button"
                        onClick={() => choose(image.imageUrl)}
                        className="block w-full bg-white p-2 text-left"
                        title="Usar esta imagem no produto"
                      >
                        <img
                          src={image.thumbnailUrl || image.imageUrl}
                          alt={image.title || 'Imagem do produto'}
                          loading="lazy"
                          className="aspect-square w-full object-contain transition group-hover:scale-[1.03]"
                        />
                      </button>

                      <div className="p-3">
                        <p className="line-clamp-2 min-h-10 text-xs font-semibold text-zinc-300">
                          {image.title || 'Imagem do produto'}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="min-w-0 truncate text-[11px] text-zinc-600">
                            {image.source || image.domain || 'Google Images'}
                          </span>
                          {image.link && (
                            <a
                              href={image.link}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(event) => event.stopPropagation()}
                              className="shrink-0 text-zinc-500 hover:text-blue-300"
                              title="Abrir página de origem"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => choose(image.imageUrl)}
                          className="mt-3 w-full rounded-lg bg-zinc-800 px-2 py-2 text-xs font-black text-white transition group-hover:bg-blue-400 group-hover:text-zinc-950"
                        >
                          Usar esta imagem
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-zinc-800 px-4 py-3 text-xs text-zinc-600 sm:px-5">
              A busca é feita pela Serper em resultados do Google Images. Verifique a licença e a autorização de uso da imagem antes de publicá-la comercialmente.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
