import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <main className="home">
      <div className="home-content">

        <h1>
          QR-Codes einfach
          <br />
          messen.
        </h1>

        <p>
          Erstelle QR-Codes und sieh auf einen Blick,
          wie oft sie gescannt wurden.
        </p>

        <Link
          to="/login"
          className="home-button"
        >
          Zum Dashboard
        </Link>

      </div>
    </main>
  );
};

export default Home;