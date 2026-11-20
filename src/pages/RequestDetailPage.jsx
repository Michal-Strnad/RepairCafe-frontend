import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Coffee,
  LockKeyhole,
  Send,
  Wrench,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import { sampleRequests } from '../data/requests.js';
import { useAuth } from '../auth/AuthContext.jsx';
import radioPhoto from '../assets/radio.jpg';
import bikePhoto from '../assets/bike.jpg';
import chairPhoto from '../assets/chair.jpg';
import lampPhoto from '../assets/lamp.jpg';
import bagPhoto from '../assets/toaster.jpg';

const requestPhotos = {
  '1': radioPhoto,
  '2': chairPhoto,
  '3': bikePhoto,
  '4': bagPhoto,
  '5': lampPhoto,
};

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\\/$/, '');

export default function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const request = sampleRequests.find((x) => x.id === id);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!request) {
    return (
      <main className="detail-not-found">
        <h1>Požadavek nebyl nalezen</h1>
        <Link className="button button-primary" to="/requests">
          Zpět na požadavky
        </Link>
      </main>
    );
  }

  async function submitInterest(event) {
    event.preventDefault();
    if (!session?.token) {
      navigate('/login', { state: { from: `/requests/${id}` } });
      return;
    }

    setBusy(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/requests/${encodeURIComponent(id)}/interests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ message: message.trim() }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          response.status === 401
            ? 'Přihlášení vypršelo. Přihlaste se prosím znovu.'
            : 'Tato akce je dostupná pouze přihlášenému dobrovolníkovi.',
        );
      }
      if (response.status === 409) {
        setSent(true);
        setShowForm(false);
        return;
      }
      if (!response.ok) {
        throw new Error(data.message || 'Zájem se nepodařilo odeslat. Zkuste to prosím znovu.');
      }

      setSent(true);
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Nepodařilo se spojit se serverem.');
    } finally {
      setBusy(false);
    }
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
          {session ? (
            <span className="signed-in-label">{session.user?.name || session.user?.email}</span>
          ) : (
            <Link className="button button-light" to="/login">
              Přihlásit se
            </Link>
          )}
        </nav>
      </header>
      <main className="detail-content">
        <Link className="detail-back" to="/requests">
          <ArrowLeft size={17} /> Zpět na seznam požadavků
        </Link>
        <article className="public-detail">
          <div className="detail-topline">
            <span className="category-label">{request.category}</span>
            <span className="status status-open">{request.status}</span>
          </div>
          <span className="eyebrow">DETAIL POŽADAVKU</span>
          <h1>{request.title}</h1>
          <img className="request-detail-photo" src={requestPhotos[request.id]} alt={request.title} />
          <p className="detail-description">{request.description}</p>
          <div className="detail-info">
            <div>
              <span>Vložil/a</span>
              <strong>{request.requester}</strong>
            </div>
            <div>
              <span>Datum zveřejnění</span>
              <strong>{request.date}</strong>
            </div>
            <div>
              <span>Kategorie</span>
              <strong>{request.category}</strong>
            </div>
          </div>
          {session && (
            <div className="owner-interest-link">
              <div>
                <strong>Jste zadavatelem tohoto požadavku?</strong>
                <p>Otevřete přehled dobrovolníků, kteří nabídli pomoc.</p>
              </div>
              <Link className="button button-secondary" to={`/requests/${id}/interests`}>
                Zobrazit zájemce
              </Link>
            </div>
          )}

          <div className="contact-protection">
            <LockKeyhole size={20} />
            <div>
              <strong>Kontaktní údaje jsou skryté</strong>
              <p>
                Kontakt na zadavatele se zobrazí až poté, co zadavatel schválí váš zájem o opravu.
              </p>
            </div>
          </div>

          {sent ? (
            <div className="interest-success" role="status" aria-live="polite">
              <CheckCircle2 size={25} />
              <div>
                <strong>Zájem o opravu odeslán</strong>
                <p>Vaše zpráva byla předána zadavateli. Nyní čekáte na jeho rozhodnutí.</p>
              </div>
            </div>
          ) : !session ? (
            <div className="interest-area">
              <h2>Chcete s opravou pomoci?</h2>
              <p>Pro odeslání zájmu se nejprve přihlaste.</p>
              <Link
                className="button button-primary"
                to="/login"
                state={{ from: `/requests/${id}` }}
              >
                <LogIn size={17} /> Přihlásit se a pokračovat
              </Link>
            </div>
          ) : !showForm ? (
            <div className="interest-area">
              <h2>Chcete s opravou pomoci?</h2>
              <p>Dejte zadavateli vědět, že máte zájem. Můžete připojit krátkou zprávu.</p>
              <button className="button button-primary" onClick={() => setShowForm(true)}>
                <Wrench size={17} /> Mám zájem o opravu
              </button>
            </div>
          ) : (
            <form className="interest-area interest-form" onSubmit={submitInterest}>
              <h2>Vyjádření zájmu</h2>
              <p>Krátce představte, jak byste mohli s opravou pomoci.</p>
              <label className="field">
                Zpráva zadavateli <span className="optional">(nepovinné)</span>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Například: S opravou podobných spotřebičů mám zkušenosti…"
                />
                <small className="character-count">{message.length}/500 znaků</small>
              </label>
              {error && (
                <div className="interest-error" role="alert">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}
              <div className="interest-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setError('');
                  }}
                  disabled={busy}
                >
                  Zrušit
                </button>
                <button type="submit" className="button button-primary" disabled={busy}>
                  <Send size={16} /> {busy ? 'Odesílám…' : 'Odeslat zájem'}
                </button>
              </div>
            </form>
          )}
        </article>
      </main>
      <footer className="request-footer">Repair Café · Komunitní opravy</footer>
    </div>
  );
}
