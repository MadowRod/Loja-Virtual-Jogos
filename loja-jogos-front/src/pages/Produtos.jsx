import { useEffect, useState } from "react";
import ProdutoCard from "../components/ProdutoCard";
import api from "../services/api";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const { data } = await api.get("/jogos");
        setProdutos(data);
      } catch {
        setErro("Nao foi possivel carregar os produtos.");
      } finally {
        setCarregando(false);
      }
    }

    carregarProdutos();
  }, []);

  return (
    <section className="stack">
      <div className="page-heading">
        <span className="eyebrow">Catalogo</span>
        <h1>Produtos</h1>
      </div>

      {carregando && <p>Carregando produtos...</p>}
      {erro && <p className="message error">{erro}</p>}
      {!carregando && !erro && produtos.length === 0 && (
        <p className="empty">Nenhum produto cadastrado.</p>
      )}
      <div className="product-grid">
        {produtos.map((produto) => (
          <ProdutoCard key={produto.id} produto={produto} />
        ))}
      </div>
    </section>
  );
}
