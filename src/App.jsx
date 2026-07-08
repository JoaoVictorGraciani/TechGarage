import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";

import Home from "./pages/Home";
import Carrinho from "./pages/Carrinho";
import Checkout from "./pages/Checkout";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </div>
  );
}

export default App;