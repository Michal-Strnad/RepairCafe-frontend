import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Coffee,
  UserRound,
  MessageSquare,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { sampleRequests } from '../data/requests.js';
import { useAuth } from '../auth/AuthContext.jsx';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

function getVolunteerName(item) {
  return item.volunteer?.name || item.user?.name || item.name || item.volunteerName || 'Dobrovolník';
}

function getCompletedRepairs(item) {
  const value =
    item.successfulRepairs ??
    item.completedRepairs ??
    item.volunteer?.successfulRepairs ??
    item.user?.successfulRepairs;
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

export default function RequestInterestsPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const request = sampleRequests.find((item) => item.id === id);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadInterests() {
      if (!session?.token) {
        setError('Pro zobrazení zájemců se musíte přihlásit.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await fetch(
          `${API_URL}/requests/${encodeURIComponent(id)}/interests`,
          {
            headers: { Authorization: `Bearer ${session.token}` },
            signal: controller.signal,
          },
        );
        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new Error('Přihlášení vypršelo. Přihlaste se prosím znovu.');
        }
        if (response.status === 403) {
          throw new Error('Zájemce může zobrazit pouze zadavatel tohoto požadavku.');
        }
        if (response.status === 404) {
          throw new Error('Požadavek nebo jeho zájemci nebyli nalezeni.');
        }
        if (!response.ok) {
          throw new Error(data.message || 'Zájemce se nepodařilo načíst.');
        }

        const rows = Array.isArray(data) ? data : data.interests;
        if (!Array.isArray(rows)) {
          throw new Error('Server vrátil neočekávaný formát seznamu zájemců.');
        }
        setInterests(rows);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Nepodařilo se spojit se serverem.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadInterests();
    return () => controller.abort();
  }, [id, session?.token]);

  if (!request) {
    return (
      <main className="interests-state">
        <h1>Požadavek nebyl nalezen</h1>
        <Link className="button button-primary" to="/requests">Zpět na požadavky</Link>
      </main>
    );
  }

  return (
    <div className="browse-page">
      <header className="browse-header">
        <Link className="brand" to="/">
          <span className="brand-mark"><Coffee /></span>
          <b>Repair Café</b>
        </Link>
        <nav>
          <Link to="/requests">Požadavky na opravu</Link>
          <span className="signed-in-label">{session?.user?.name || session?.user?.email}</span>
        </nav>
      </header>

      <main className="interests-content">
        <Link className="detail-back" to={`/requests/${id}`}>
          <ArrowLeft size={17} /> Zpět na detail požadavku
        </Link>

        <div className="interests-heading">
          <span className="eyebrow">SPRÁVA POŽADAVKU</span>
          <h1>Zájemci o opravu</h1>
          <p>Dobrovolníci, kteří nabídli pomoc s požadavkem „{request.title}“.</p>
        </div>

        <section className="interests-summary" aria-live="polite">
          <Users size={22} />
          <div>
            <strong>{loading ? '…' : interests.length}</strong>
            <span>{interests.length === 1 ? 'zájemce' : interests.length >= 2 && interests.length <= 4 ? 'zájemci' : 'zájemců'}</span>
          </div>
        </section>

        {loading ? (
          <div className="interests-state" role="status">Načítám zájemce…</div>
        ) : error ? (
          <div className="interests-message interests-message-error" role="alert">
            <AlertCircle size={20} />
            <div>
              <strong>Zájemce se nepodařilo zobrazit</strong>
              <p>{error}</p>
              {error.includes('přihlásit') && (
                <Link className="button button-primary" to="/login" state={{ from: `/requests/${id}/interests` }}>
                  Přihlásit se
                </Link>
              )}
            </div>
          </div>
        ) : interests.length === 0 ? (
          <div className="interests-empty">
            <Users size={34} />
            <h2>Zatím nikdo neprojevil zájem</h2>
            <p>Jakmile se přihlásí dobrovolník, zobrazí se zde jeho zpráva a profilové informace.</p>
          </div>
        ) : (
          <div className="interest-list">
            {interests.map((item, index) => {
              const volunteerName = getVolunteerName(item);
              const completedRepairs = getCompletedRepairs(item);
              const message = item.message || item.note || '';
              return (
                <article className="interest-card" key={item.id || item._id || item.userId || index}>
                  <div className="interest-avatar"><UserRound size={23} /></div>
                  <div className="interest-card-main">
                    <div className="interest-card-top">
                      <h2>{volunteerName}</h2>
                      {completedRepairs !== null && (
                        <span className="repair-count">
                          <CheckCircle2 size={15} /> {completedRepairs} {completedRepairs === 1 ? 'úspěšná oprava' : completedRepairs >= 2 && completedRepairs <= 4 ? 'úspěšné opravy' : 'úspěšných oprav'}
                        </span>
                      )}
                    </div>
                    <div className="interest-message">
                      <MessageSquare size={17} />
                      <p>{message || 'Dobrovolník nepřipojil žádnou zprávu.'}</p>
                    </div>
                    <div className="interest-card-footer">
                      <span><Wrench size={15} /> Zájem o tento požadavek</span>
                      <span className="status status-open">Čeká na vaše rozhodnutí</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="implementation-note">
          Výběr dobrovolníka bude navazovat v dalším kroku (S10). Zobrazení seznamu respektuje oprávnění ověřovaná backendem.
        </div>
      </main>
      <footer className="request-footer">Repair Café · Komunitní opravy</footer>
    </div>
  );
}
