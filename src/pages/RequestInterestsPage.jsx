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
  Check,
  X,
} from 'lucide-react';
import { sampleRequests } from '../data/requests.js';
import { useAuth } from '../auth/AuthContext.jsx';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

function getVolunteerName(item) {
  return (
    item.volunteer?.name || item.user?.name || item.name || item.volunteerName || 'Dobrovolník'
  );
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
  const [selectionTarget, setSelectionTarget] = useState(null);
  const [selecting, setSelecting] = useState(false);
  const [selectionError, setSelectionError] = useState('');
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

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
        const response = await fetch(`${API_URL}/requests/${encodeURIComponent(id)}/interests`, {
          headers: { Authorization: `Bearer ${session.token}` },
          signal: controller.signal,
        });
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
        if (!Array.isArray(data)) {
          const selected =
            data.selectedVolunteer ||
            data.request?.selectedVolunteer ||
            data.selectedInterest ||
            null;
          setSelectedVolunteer(selected);
        }
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

  async function confirmVolunteerSelection() {
    if (!selectionTarget || !session?.token) return;
    const interestId = selectionTarget.id || selectionTarget._id || selectionTarget.interestId;
    if (!interestId) {
      setSelectionError('U zájemce chybí identifikátor. Výběr nelze bezpečně dokončit.');
      return;
    }

    setSelecting(true);
    setSelectionError('');
    try {
      const response = await fetch(
        `${API_URL}/requests/${encodeURIComponent(id)}/select-volunteer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.token}`,
          },
          body: JSON.stringify({ interestId }),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (response.status === 401)
        throw new Error('Přihlášení vypršelo. Přihlaste se prosím znovu.');
      if (response.status === 403)
        throw new Error('Dobrovolníka může vybrat pouze zadavatel požadavku.');
      if (response.status === 409)
        throw new Error(data.message || 'K tomuto požadavku již byl dobrovolník vybrán.');
      if (response.status === 404)
        throw new Error('Zájemce nebo požadavek již neexistuje. Obnovte prosím stránku.');
      if (!response.ok) throw new Error(data.message || 'Dobrovolníka se nepodařilo vybrat.');

      const chosen = data.selectedVolunteer || data.volunteer || selectionTarget;
      setSelectedVolunteer(chosen);
      setSelectionTarget(null);
      setInterests((current) => current);
    } catch (err) {
      setSelectionError(err.message || 'Nepodařilo se spojit se serverem.');
    } finally {
      setSelecting(false);
    }
  }

  if (!request) {
    return (
      <main className="interests-state">
        <h1>Požadavek nebyl nalezen</h1>
        <Link className="button button-primary" to="/requests">
          Zpět na požadavky
        </Link>
      </main>
    );
  }

  return (
    <div className="browse-page">
      <header className="browse-header">
        <Link className="brand" to="/">
          <span className="brand-mark">
            <Coffee />
          </span>
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

        {selectedVolunteer && (
          <section className="selected-volunteer-banner" role="status" aria-live="polite">
            <span className="selected-volunteer-icon">
              <Check size={20} />
            </span>
            <div>
              <strong>Dobrovolník byl vybrán</strong>
              <p>
                {getVolunteerName(selectedVolunteer)} bude s vámi domlouvat termín opravy. Kontaktní
                údaje a další postup se řídí stavem požadavku.
              </p>
            </div>
          </section>
        )}

        <section className="interests-summary" aria-live="polite">
          <Users size={22} />
          <div>
            <strong>{loading ? '…' : interests.length}</strong>
            <span>
              {interests.length === 1
                ? 'zájemce'
                : interests.length >= 2 && interests.length <= 4
                  ? 'zájemci'
                  : 'zájemců'}
            </span>
          </div>
        </section>

        {loading ? (
          <div className="interests-state" role="status">
            Načítám zájemce…
          </div>
        ) : error ? (
          <div className="interests-message interests-message-error" role="alert">
            <AlertCircle size={20} />
            <div>
              <strong>Zájemce se nepodařilo zobrazit</strong>
              <p>{error}</p>
              {error.includes('přihlásit') && (
                <Link
                  className="button button-primary"
                  to="/login"
                  state={{ from: `/requests/${id}/interests` }}
                >
                  Přihlásit se
                </Link>
              )}
            </div>
          </div>
        ) : interests.length === 0 ? (
          <div className="interests-empty">
            <Users size={34} />
            <h2>Zatím nikdo neprojevil zájem</h2>
            <p>
              Jakmile se přihlásí dobrovolník, zobrazí se zde jeho zpráva a profilové informace.
            </p>
          </div>
        ) : (
          <div className="interest-list">
            {interests.map((item, index) => {
              const volunteerName = getVolunteerName(item);
              const completedRepairs = getCompletedRepairs(item);
              const message = item.message || item.note || '';
              return (
                <article
                  className="interest-card"
                  key={item.id || item._id || item.userId || index}
                >
                  <div className="interest-avatar">
                    <UserRound size={23} />
                  </div>
                  <div className="interest-card-main">
                    <div className="interest-card-top">
                      <h2>{volunteerName}</h2>
                      {completedRepairs !== null && (
                        <span className="repair-count">
                          <CheckCircle2 size={15} /> {completedRepairs}{' '}
                          {completedRepairs === 1
                            ? 'úspěšná oprava'
                            : completedRepairs >= 2 && completedRepairs <= 4
                              ? 'úspěšné opravy'
                              : 'úspěšných oprav'}
                        </span>
                      )}
                    </div>
                    <div className="interest-message">
                      <MessageSquare size={17} />
                      <p>{message || 'Dobrovolník nepřipojil žádnou zprávu.'}</p>
                    </div>
                    <div className="interest-card-footer">
                      <span>
                        <Wrench size={15} /> Zájem o tento požadavek
                      </span>
                      {selectedVolunteer ? (
                        <span className="status status-selected">
                          {(selectedVolunteer.id ||
                            selectedVolunteer._id ||
                            selectedVolunteer.interestId) ===
                          (item.id || item._id || item.interestId)
                            ? 'Vybraný dobrovolník'
                            : 'Výběr dokončen'}
                        </span>
                      ) : (
                        <span className="status status-open">Čeká na vaše rozhodnutí</span>
                      )}
                    </div>
                    {!selectedVolunteer && (
                      <div className="interest-select-row">
                        <button
                          className="button button-primary"
                          type="button"
                          onClick={() => {
                            setSelectionTarget(item);
                            setSelectionError('');
                          }}
                        >
                          <Check size={16} /> Vybrat dobrovolníka
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {selectionTarget && (
          <div
            className="selection-dialog-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !selecting) setSelectionTarget(null);
            }}
          >
            <section
              className="selection-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="selection-dialog-title"
            >
              <button
                className="selection-dialog-close"
                type="button"
                aria-label="Zavřít"
                onClick={() => setSelectionTarget(null)}
                disabled={selecting}
              >
                <X size={19} />
              </button>
              <span className="eyebrow">POTVRZENÍ VÝBĚRU</span>
              <h2 id="selection-dialog-title">Vybrat dobrovolníka?</h2>
              <p>
                Opravdu chcete pro požadavek „{request.title}“ vybrat dobrovolníka{' '}
                <strong>{getVolunteerName(selectionTarget)}</strong>?
              </p>
              <p className="selection-dialog-hint">
                Po potvrzení bude výběr uložen a budete moci domluvit termín opravy.
              </p>
              {selectionError && (
                <div className="interest-error" role="alert">
                  <AlertCircle size={18} />
                  <span>{selectionError}</span>
                </div>
              )}
              <div className="interest-actions">
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => setSelectionTarget(null)}
                  disabled={selecting}
                >
                  Zrušit
                </button>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={confirmVolunteerSelection}
                  disabled={selecting}
                >
                  {selecting ? 'Ukládám…' : 'Potvrdit výběr'}
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
      <footer className="request-footer">Repair Café · Komunitní opravy</footer>
    </div>
  );
}
