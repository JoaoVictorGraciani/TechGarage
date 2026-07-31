import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Produtos from './pages/Produtos';
import Categorias from './pages/Categorias';
import Usuarios from './pages/Usuarios';
import CadastroProduto from './pages/CadastroProduto';

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/produtos" replace />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/produtos/novo" element={<CadastroProduto />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;