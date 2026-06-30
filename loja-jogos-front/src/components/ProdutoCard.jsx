import { useState } from "react";

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function salvarNoCarrinho(produto) {
  const carrinhoAtual = JSON.parse(
    localStorage.getItem("lojaJogosCarrinho") || "[]"
  );
  const itemExistente = carrinhoAtual.find(
    (item) => item.jogo.id === produto.id
  );

  const novoCarrinho = itemExistente
    ? carrinhoAtual.map((item) =>
        item.jogo.id === produto.id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      )
    : [...carrinhoAtual, { jogo: produto, quantidade: 1 }];

  localStorage.setItem("lojaJogosCarrinho", JSON.stringify(novoCarrinho));
}

function obterClassePlataforma(plataforma = "") {
  if (plataforma.toLowerCase().includes("xbox")) {
    return "xbox";
  }

  return "playstation";
}

function obterClasseCategoria(categoria = "") {
  return categoria
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function ProdutoCard({ produto, onAdd }) {
  const [mensagem, setMensagem] = useState("");
  const plataformaClasse = obterClassePlataforma(produto.plataforma);
  const categoriaClasse = obterClasseCategoria(produto.categoria);

  function adicionarAoCarrinho() {
    salvarNoCarrinho(produto);
    setMensagem("Adicionado ao carrinho");
    onAdd?.();
    window.setTimeout(() => setMensagem(""), 1600);
  }

  return (
    <article
      className={`card product-card ${plataformaClasse} ${categoriaClasse}`}
    >
      <div className={`product-art ${categoriaClasse}`}>
        {produto.imagemUrl ? (
          <img src={produto.imagemUrl} alt={produto.nome} loading="lazy" />
        ) : (
          <span aria-hidden="true">
            {produto.plataforma?.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <div className="card-body">
        <span className={`badge ${plataformaClasse}`}>
          {produto.plataforma}
        </span>
        <h2>{produto.nome}</h2>
        <p>{produto.categoria}</p>
        <strong>{formatarMoeda(produto.preco)}</strong>
      </div>
      <button
        type="button"
        aria-label={`Adicionar ${produto.nome} ao carrinho`}
        onClick={adicionarAoCarrinho}
      >
        Adicionar
      </button>
      {mensagem && <p className="message success">{mensagem}</p>}
    </article>
  );
}
