function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(data));
}

export default function PedidoCard({ pedido }) {
  return (
    <article className="card order-card">
      <header className="order-header">
        <div>
          <span className="eyebrow">Pedido #{pedido.id}</span>
          <h2>{pedido.cliente.nome}</h2>
        </div>
        <span className="status">{pedido.statusPedido}</span>
      </header>
      <p>{formatarData(pedido.dataPedido)}</p>
      <ul className="item-list" aria-label={`Itens do pedido ${pedido.id}`}>
        {pedido.itens.map((item) => (
          <li key={item.id}>
            <span>{item.jogo.nome}</span>
            <span>{item.quantidade} un.</span>
          </li>
        ))}
      </ul>
      <strong>Total: {formatarMoeda(pedido.valorTotal)}</strong>
    </article>
  );
}
