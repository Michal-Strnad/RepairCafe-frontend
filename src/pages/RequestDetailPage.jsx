import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Coffee, LockKeyhole, Send, Wrench } from 'lucide-react';
import { sampleRequests } from '../data/requests.js';
export default function RequestDetailPage() {
  const { id } = useParams();
  const request = sampleRequests.find((x) => x.id === id);
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  if (!request)
    return (
      <main className="detail-not-found">
        <h1>Požadavek nebyl nalezen</h1>
        <Link className="button button-primary" to="/requests">
          Zpět na požadavky
        </Link>
      </main>
    );
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
          <Link className="button button-light" to="/login">
            Přihlásit se
          </Link>
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
          <div className="contact-protection">
            <LockKeyhole size={20} />
            <div>
              <strong>Kontaktní údaje jsou skryté</strong>
              <p>
                Kontakt na zadavatele se zobrazí až poté, co zadavatel schválí váš zájem o opravu.
              </p>
            </div>
          </div>
          {!sent ? (
            <div className="interest-area">
              {!show ? (
                <>
                  <h2>Chcete s opravou pomoci?</h2>
                  <p>Dejte zadavateli vědět, že máte zájem. Můžete připojit krátkou zprávu.</p>
                  <button className="button button-primary" onClick={() => setShow(true)}>
                    <Wrench size={17} /> Mám zájem o opravu
                  </button>
                </>
              ) : (
                <>
                  <h2>Vyjádření zájmu</h2>
                  <label className="field">
                    Zpráva zadavateli <span className="optional">(nepovinné)</span>
                    <textarea
                      rows={4}
                      maxLength={500}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Napište stručně, jak byste mohli s opravou pomoci…"
                    />
                  </label>
                  <div className="interest-actions">
                    <button className="button button-secondary" onClick={() => setShow(false)}>
                      Zrušit
                    </button>
                    <button className="button button-primary" onClick={() => setSent(true)}>
                      <Send size={16} /> Odeslat zájem
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="interest-success">
              <CheckCircle2 size={25} />
              <div>
                <strong>Zájem byl zaznamenán v prototypu.</strong>
                <p>
                  V této verzi se zpráva pouze zobrazí jako potvrzení a není odeslána na server.
                </p>
              </div>
            </div>
          )}
        </article>
        <p className="prototype-note">
          Prototyp: detail i vyjádření zájmu používají ukázková data. Odesílání zájmu a schvalování
          zadavatelem vyžaduje doplnění backendového API.
        </p>
      </main>
      <footer className="request-footer">Repair Café · Komunitní opravy</footer>
    </div>
  );
}
