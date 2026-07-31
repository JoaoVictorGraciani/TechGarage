// src/pages/CadastroProduto.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const categoriasExemplo = [
  { id: 1, name: 'Notebooks' },
  { id: 2, name: 'Monitores' },
  { id: 3, name: 'Gamer' },
  { id: 4, name: 'Smartphones' },
  { id: 5, name: 'Headsets e Áudio' },
  { id: 6, name: 'Teclados e Mouses' },
  { id: 7, name: 'Armazenamento' },
  { id: 8, name: 'Memória e Componentes' },
];

function CadastroProduto() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);

  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    price: '',
    stock: '',
    image: '',
    description: '',
  });

  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState(null); // { tipo: 'sucesso' | 'erro', texto: '' }

  useEffect(() => {
    async function carregarCategorias() {
      try {
        const res = await api.get('/categories');
        setCategorias(res.data);
      } catch (err) {
        setCategorias(categoriasExemplo);
      }
    }
    carregarCategorias();
  }, []);

  const handleChange = (campo) => (e) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));
  };

  const validar = () => {
    const novosErros = {};

    if (!form.name.trim()) novosErros.name = 'Nome é obrigatório.';
    if (!form.categoryId) novosErros.categoryId = 'Categoria é obrigatória.';
    if (!form.price || Number(form.price) <= 0) novosErros.price = 'Preço deve ser maior que zero.';
    if (form.stock === '' || Number(form.stock) < 0) novosErros.stock = 'Quantidade deve ser maior ou igual a zero.';
    if (!form.description.trim()) novosErros.description = 'Descrição é obrigatória.';
    if (form.image && !/^https?:\/\/.+/.test(form.image)) novosErros.image = 'URL da imagem inválida.';

    return novosErros;
  };

  const limparFormulario = () => {
    setForm({ name: '', categoryId: '', price: '', stock: '', image: '', description: '' });
    setErros({});
    setMensagem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const novosErros = validar();
    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      setMensagem({ tipo: 'erro', texto: 'Corrija os campos destacados antes de salvar.' });
      return;
    }

    try {
      setEnviando(true);
      setMensagem(null);

      await api.post('/products', {
        name: form.name.trim(),
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        stock: Number(form.stock),
        image: form.image.trim() || null,
        description: form.description.trim(),
      });

      setMensagem({ tipo: 'sucesso', texto: 'Produto cadastrado com sucesso!' });
      limparFormulario();
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: 'Não foi possível salvar o produto. Tente novamente.' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">TechGarage Store</h1>
      <p className="text-[var(--color-text-secondary)] mb-6">Cadastro de Produtos</p>

      {mensagem && (
        <div
          className={`mb-4 px-4 py-3 rounded-[var(--radius-sm)] text-sm ${
            mensagem.tipo === 'sucesso'
              ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/30'
              : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/30'
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 flex flex-col gap-4"
      >
        <Campo label="Nome do Produto" erro={erros.name}>
          <input
            type="text"
            value={form.name}
            onChange={handleChange('name')}
            className={inputClasses(erros.name)}
            placeholder="Ex: Notebook Gamer Dell G15"
          />
        </Campo>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo label="Categoria" erro={erros.categoryId}>
            <select
              value={form.categoryId}
              onChange={handleChange('categoryId')}
              className={inputClasses(erros.categoryId)}
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Campo>

          <Campo label="Preço (R$)" erro={erros.price}>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange('price')}
              className={inputClasses(erros.price)}
              placeholder="0,00"
            />
          </Campo>
        </div>

        <Campo label="Quantidade em Estoque" erro={erros.stock}>
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={handleChange('stock')}
            className={inputClasses(erros.stock)}
            placeholder="0"
          />
        </Campo>

        <Campo label="URL da Imagem" erro={erros.image}>
          <input
            type="text"
            value={form.image}
            onChange={handleChange('image')}
            className={inputClasses(erros.image)}
            placeholder="https://..."
          />
        </Campo>

        <Campo label="Descrição" erro={erros.description}>
          <textarea
            value={form.description}
            onChange={handleChange('description')}
            rows={4}
            className={inputClasses(erros.description)}
            placeholder="Descreva o produto..."
          />
        </Campo>

        <div className="flex gap-3 justify-end pt-2 border-t border-[var(--color-border)] mt-2">
          <button
            type="button"
            onClick={limparFormulario}
            className="text-sm text-[var(--color-text-secondary)] px-4 py-2 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={() => navigate('/produtos')}
            className="text-sm text-[var(--color-text-secondary)] px-4 py-2 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando}
            className="bg-[var(--color-accent)] text-[var(--color-accent-contrast)] text-sm font-semibold px-5 py-2 rounded-[var(--radius-sm)] hover:bg-[var(--color-accent-hover)] transition-all active:scale-95 disabled:opacity-50"
          >
            {enviando ? 'Salvando...' : 'Salvar Produto'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Campo({ label, erro, children }) {
  return (
    <div>
      <label className="text-sm text-[var(--color-text-secondary)] block mb-1">{label}</label>
      {children}
      {erro && <p className="text-[var(--color-danger)] text-xs mt-1">{erro}</p>}
    </div>
  );
}

function inputClasses(erro) {
  return `w-full bg-[var(--color-bg)] border rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none transition-colors ${
    erro
      ? 'border-[var(--color-danger)]'
      : 'border-[var(--color-border)] focus:border-[var(--color-accent)]'
  }`;
}

export default CadastroProduto;