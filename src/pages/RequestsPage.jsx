import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Plus,
  Plug,
  Armchair,
  Bike,
  Shirt,
  Lightbulb,
  Wrench,
  ArrowRight,
} from 'lucide-react';
import { sampleRequests } from '../data/requests.js';
const icons = { plug: Plug, armchair: Armchair, bike: Bike, shirt: Shirt, lightbulb: Lightbulb };
const categories = ['Všechny kategorie', ...new Set(sampleRequests.map((item) => item.category))];
export default function RequestsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [sort, setSort] = useState('newest');
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('cs');
    return sampleRequests
      .filter(
        (x) =>
          (category === categories[0] || x.category === category) &&
          (!q || `${x.title} ${x.description} ${x.category}`.toLocaleLowerCase('cs').includes(q)),
      )
      .sort((a, b) =>
        sort === 'newest' ? Number(b.id) - Number(a.id) : a.title.localeCompare(b.title, 'cs'),
      );
  }, [query, category, sort]);
  return (
    <div className="browse-page">
      <header className="browse-header">
        <Link className="brand" to="/">
          <span className="brand-mark">
            <Wrench />
          </span>
          <b>Repair Café</b>
        </Link>
        <nav>
          <Link to="/">Úvodní stránka</Link>
          <Link to="/requests/new">Vytvořit požadavek</Link>
          <Link className="button button-light" to="/login">
            Přihlásit se
          </Link>
        </nav>
      </header>
      <main className="browse-content">
        <div className="browse-title">
          <div>
            <span className="eyebrow">POMOC, KTERÁ MÁ SMYSL</span>
            <h1>Požadavky na opravu</h1>
            <p>Prohlédněte si věci, kterým můžete společně s jejich majiteli dát druhou šanci.</p>
          </div>
          <Link className="button button-primary" to="/requests/new">
            <Plus size={18} /> Přidat požadavek
          </Link>
        </div>
        <div className="browse-stats">
          <div>
            <strong>{sampleRequests.length}</strong>
            <span>otevřených požadavků</span>
          </div>
          <div>
            <strong>6</strong>
            <span>kategorií oprav</span>
          </div>
          <div>
            <strong>Společně</strong>
            <span>dokážeme více</span>
          </div>
        </div>
        <div className="browse-tools">
          <label className="browse-search">
            <Search size={19} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hledat podle názvu nebo popisu…"
            />
          </label>
          <label className="browse-filter">
            <SlidersHorizontal size={17} />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="browse-sort">
            <span>Řadit:</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Nejnovější</option>
              <option value="title">Podle názvu</option>
            </select>
          </label>
        </div>
        <div className="browse-result-count">
          Zobrazeno {filtered.length} z {sampleRequests.length} požadavků
        </div>
        {filtered.length ? (
          <div className="request-cards">
            {filtered.map((item) => {
              const Icon = icons[item.icon] || Wrench;
              return (
                <article className="request-card" key={item.id}>
                  <div className="request-card-icon">
                    <Icon size={23} />
                  </div>
                  <div className="request-card-body">
                    <div className="request-card-meta">
                      <span className="category-label">{item.category}</span>
                      <span className="status status-open">{item.status}</span>
                    </div>
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                    <div className="request-card-footer">
                      <span>
                        {item.requester} · {item.date}
                      </span>
                      <Link to={`/requests/${item.id}`}>
                        Zobrazit detail <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-results">
            <Search size={30} />
            <h2>Žádné požadavky nenalezeny</h2>
            <p>Zkuste upravit hledaný výraz nebo vybranou kategorii.</p>
            <button
              className="button button-secondary"
              onClick={() => {
                setQuery('');
                setCategory(categories[0]);
              }}
            >
              Zrušit filtry
            </button>
          </div>
        )}
        <p className="prototype-note">
          Ukázková data: požadavky jsou v této fázi načteny z lokálního souboru. Napojení na
          databázi doplníme po rozšíření backendového API.
        </p>
      </main>
      <footer className="request-footer">Repair Café · Komunitní opravy</footer>
    </div>
  );
}
