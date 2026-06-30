import { Link } from "react-router-dom";

const categorias = [
  "Jogos de PS4",
  "Jogos de PS5",
  "Jogos de Xbox One",
  "Jogos de Xbox Series",
  "Consoles",
  "Controles",
];

export default function Home() {
  return (
    <section className="home-layout">
      <div className="hero-panel">
        <div>
          <span className="eyebrow">Games Store</span>
          <h1>Loja Virtual de Jogos</h1>
          <p>
            Jogos, consoles e controles para PlayStation e Xbox em um catalogo
            rapido, organizado e pronto para comprar.
          </p>
          <div className="hero-actions">
            <Link className="button" to="/produtos">
              Ver produtos
            </Link>
            <Link className="button ghost" to="/buscar">
              Buscar item
            </Link>
          </div>
        </div>
        <div className="console-visual" aria-hidden="true">
          <span>PS5</span>
          <span>Xbox</span>
          <span>PS4</span>
        </div>
      </div>

      <section className="category-strip" aria-label="Categorias da loja">
        {categorias.map((categoria) => (
          <span key={categoria}>{categoria}</span>
        ))}
      </section>
    </section>
  );
}
