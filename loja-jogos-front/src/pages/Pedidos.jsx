import { useEffect, useMemo, useState } from "react";
import PedidoCard from "../components/PedidoCard";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

export default function Pedidos() {
  const { cliente } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarPedidos() {
      try {
        const { data } = await api.get("/pedidos");
        setPedidos(data);
      } catch {
        setErro("Nao foi possivel carregar os pedidos.");
      } finally {
        setCarregando(false);
      }
    }

    carregarPedidos();
  }, []);

  const clienteId = cliente?.id;

  const pedidosCliente = useMemo(
    () =>
      clienteId
        ? pedidos.filter((pedido) => pedido.cliente?.id === clienteId)
        : [],
    [clienteId, pedidos]
  );

  return (
    <section className="stack">
      <div className="page-heading">
        <span className="eyebrow">Historico</span>
        <h1>Pedidos</h1>
      </div>

      {carregando && <p>Carregando pedidos...</p>}
      {erro && <p className="message error">{erro}</p>}
      {!carregando && !erro && pedidosCliente.length === 0 && (
        <p className="empty">Nenhum pedido encontrado para este cliente.</p>
      )}
      <div className="order-grid">
        {pedidosCliente.map((pedido) => (
          <PedidoCard key={pedido.id} pedido={pedido} />
        ))}
      </div>
    </section>
  );
}
