import { useEffect, useMemo, useState } from "react";
import ProdutoCard from "../components/ProdutoCard";
import api from "../services/api";

export default function Buscar() {
  const [produtos, setProdutos] = useState([]);
  const [termo, setTermo] = useState("");
  const [plataforma, setPlataforma] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const { data } = await api.get("/jogos");
        setProdutos(data);
      } finally {
        setCarregando(false);
      }
    }

    carregarProdutos();
  }, []);

  const plataformas = useMemo(
    () => [...new Set(produtos.map((produto) => produto.plataforma))],
    [produtos]
  );

  const resultados = useMemo(() => {
    return produtos.filter((produto) => {
      const texto = `${produto.nome} ${produto.categoria} ${produto.plataforma}`;
      const bateTermo = texto.toLowerCase().includes(termo.toLowerCase());
      const batePlataforma = !plataforma || produto.plataforma === plataforma;
      return bateTermo && batePlataforma;
    });
  }, [plataforma, produtos, termo]);

  return (
    <section className="stack">
      <div className="page-heading">
        <span className="eyebrow">Busca</span>
        <h1>Buscar produtos</h1>
      </div>

      <form className="toolbar" role="search">
        <div className="field">
          <label htmlFor="buscaProduto">Nome, categoria ou plataforma</label>
          <input
            id="buscaProduto"
            type="search"
            value={termo}
            onChange={(event) => setTermo(event.target.value)}
            placeholder="Ex.: Playstation, controle, corrida"
            aria-label="Buscar produto"
          />
        </div>
        <div className="field">
          <label htmlFor="filtroPlataforma">Plataforma</label>
          <select
            id="filtroPlataforma"
            value={plataforma}
            onChange={(event) => setPlataforma(event.target.value)}
          >
            <option value="">Todas</option>
            {plataformas.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </form>

      {carregando && <p>Carregando produtos...</p>}
      {!carregando && resultados.length === 0 && (
        <p className="empty">Nenhum produto encontrado.</p>
      )}
      <div className="product-grid">
        {resultados.map((produto) => (
          <ProdutoCard key={produto.id} produto={produto} />
        ))}
      </div>
    </section>
  );
}
