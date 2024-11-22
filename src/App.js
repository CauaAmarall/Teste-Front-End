import React, { useState, useEffect } from "react";
import axios from "axios";
import md5 from "md5";
import "./App.css";
import Logo from "./assets/logo/Group@3x.png";
import NoFavorite from "./assets/icones/heart/Path Copy 2.png";
import Favorite from "./assets/icones/heart/Path@1,5x.png";
import Search from "./assets/busca/Lupa/Shape@1,5x.svg";

const API_BASE_URL = "https://gateway.marvel.com/v1/public/characters";
const API_PUBLIC_KEY = "288ba36cd444eb7724cfc60fa012a0ac";
const API_PRIVATE_KEY = "31a278fe77a9a56931d955d7c46d98af39c53776";

function App() {
  const [heroes, setHeroes] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [favorites, setFavorites] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [selectedHero, setSelectedHero] = useState(null);
  const [comics, setComics] = useState([]);

  useEffect(() => {
    fetchHeroes();
    loadFavoritesFromLocalStorage();
  }, []);

  const fetchHeroes = async () => {
    const ts = Date.now().toString();
    const hash = md5(ts + API_PRIVATE_KEY + API_PUBLIC_KEY);

    try {
      const response = await axios.get(API_BASE_URL, {
        params: {
          apikey: API_PUBLIC_KEY,
          ts: ts,
          hash: hash,
          limit: 20,
        },
      });
      setHeroes(response.data.data.results);
    } catch (error) {
      console.error("Erro ao buscar heróis:", error);
    }
  };

  const loadFavoritesFromLocalStorage = () => {
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  };

  const saveFavoritesToLocalStorage = (updatedFavorites) => {
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  const toggleFavorite = (hero) => {
    const isFavorite = favorites.includes(hero.id);
    let updatedFavorites;

    if (isFavorite) {
      updatedFavorites = favorites.filter((id) => id !== hero.id);
    } else if (favorites.length < 5) {
      updatedFavorites = [...favorites, hero.id];
    } else {
      alert("Você pode favoritar no máximo 5 personagens.");
      return;
    }

    setFavorites(updatedFavorites);
    saveFavoritesToLocalStorage(updatedFavorites);
  };

  const fetchComics = async (heroId) => {
    const ts = Date.now().toString();
    const hash = md5(ts + API_PRIVATE_KEY + API_PUBLIC_KEY);

    try {
      const response = await axios.get(`${API_BASE_URL}/${heroId}/comics`, {
        params: {
          apikey: API_PUBLIC_KEY,
          ts: ts,
          hash: hash,
          orderBy: "-onsaleDate",
          limit: 10,
        },
      });
      setComics(response.data.data.results);
    } catch (error) {
      console.error("Erro ao buscar quadrinhos:", error);
    }
  };

  const showHeroDetails = (hero) => {
    setSelectedHero(hero);
    fetchComics(hero.id);
  };

  const filteredHeroes = heroes
    .filter((hero) => {
      if (showOnlyFavorites) {
        return favorites.includes(hero.id);
      }
      return hero.name.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) =>
      sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );

  return (
    <div className="App">
      <header className="App-header">
        <img src={Logo} alt="Marvel Logo" />
        <h1>EXPLORE O UNIVERSO</h1>
        <p>
          Mergulhe no domínio deslumbrante de todos os personagens clássicos que
          você ama - e aqueles que você descobrirá em breve!
        </p>
      </header>

      <div className="search-heroes">
        <img src={Search} alt="Pesquisar heróis" />
        <input
          type="text"
          placeholder="Procure por heróis"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={showOnlyFavorites}
        />
      </div>

      <div className="search-bar">
        <p>Encontrados {filteredHeroes.length} heróis</p>
        <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
          Ordenar por nome: {sortOrder === "asc" ? "A-Z" : "Z-A"}
        </button>
        <label>
          <input
            type="checkbox"
            checked={showOnlyFavorites}
            onChange={() => setShowOnlyFavorites(!showOnlyFavorites)}
          />
          <div className="OnlyFavorite">
            <img src={Favorite} alt="Somente Favoritos" /> <p>Somente Favoritos</p>
          </div>
        </label>
      </div>

      <div className="heroes-grid">
        {filteredHeroes.map((hero) => (
          <div key={hero.id} className="hero-card">
            <img className="hero-card-img"
              src={`${hero.thumbnail.path}.${hero.thumbnail.extension}`}
              alt={hero.name}
              onClick={() => showHeroDetails(hero)}
            />
            <div className="hero-info">
              <h3>{hero.name}</h3>
              <button
                className="favorite-btn"
                onClick={() => toggleFavorite(hero)}
              >
                <img
                  src={favorites.includes(hero.id) ? Favorite : NoFavorite}
                  alt="Favoritar"
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedHero && (
        <div className="hero-details">
          <h2>{selectedHero.name}</h2>
          <p>{selectedHero.description || "Sem descrição disponível."}</p>
          <h3>Últimos 10 quadrinhos:</h3>
          <ul>
            {comics.map((comic) => (
              <li key={comic.id}>
                {comic.title} - {new Date(comic.dates[0].date).toLocaleDateString()}
              </li>
            ))}
          </ul>
          <button onClick={() => setSelectedHero(null)}>Fechar</button>
        </div>
      )}
    </div>
  );
}

export default App;