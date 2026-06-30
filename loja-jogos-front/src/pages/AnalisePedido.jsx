import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function AnalisePedido() {
  const { cliente } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarPedidos() {
      try {
        const { data } = await api.get("/pedidos");
        setPedidos(data.filter((pedido) => pedido.cliente.id === cliente.id));
      } catch {
        setErro("Nao foi possivel carregar a analise dos pedidos.");
      } finally {
        setCarregando(false);
      }
    }

    carregarPedidos();
  }, [cliente.id]);

  const analise = useMemo(() => {
    const totalPedidos = pedidos.length;
    const valorTotal = pedidos.reduce(
      (soma, pedido) => soma + Number(pedido.valorTotal),
      0
    );
    const itens = pedidos.flatMap((pedido) => pedido.itens);
    const totalItens = itens.reduce((soma, item) => soma + item.quantidade, 0);
    const plataformas = itens.reduce((acc, item) => {
      const plataforma = item.jogo.plataforma;
      acc[plataforma] = (acc[plataforma] || 0) + item.quantidade;
      return acc;
    }, {});
    const plataformaFavorita =
      Object.entries(plataformas).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "Sem dados";

    return { totalPedidos, valorTotal, totalItens, plataformaFavorita };
  }, [pedidos]);

  return (
    <section className="stack">
      <div className="page-heading">
        <span className="eyebrow">Analise</span>
        <h1>Analise de pedidos</h1>
      </div>

      {carregando && <p>Carregando analise...</p>}
      {erro && <p className="message error">{erro}</p>}
      {!carregando && !erro && (
        <div className="analytics-grid">
          <article className="card metric">
            <span>Pedidos</span>
            <strong>{analise.totalPedidos}</strong>
          </article>
          <article className="card metric">
            <span>Itens comprados</span>
            <strong>{analise.totalItens}</strong>
          </article>
          <article className="card metric">
            <span>Total gasto</span>
            <strong>{formatarMoeda(analise.valorTotal)}</strong>
          </article>
          <article className="card metric">
            <span>Plataforma favorita</span>
            <strong>{analise.plataformaFavorita}</strong>
          </article>
        </div>
      )}
    </section>
  );
}
