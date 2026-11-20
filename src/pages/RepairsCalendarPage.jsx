import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Coffee,
  AlertCircle,
  RefreshCw,
  Clock3,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const WEEKDAYS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
const monthFormatter = new Intl.DateTimeFormat('cs-CZ', { month: 'long', year: 'numeric' });
const timeFormatter = new Intl.DateTimeFormat('cs-CZ', { hour: '2-digit', minute: '2-digit' });
function getDate(item) {
  const value =
    item.scheduledAt ||
    item.scheduledDate ||
    item.repairDate ||
    item.date ||
    item.appointment?.start;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
function getEnd(item, start) {
  const value = item.appointment?.end || item.scheduledEnd || item.endAt;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
function startOfWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}
function sameDay(a, b) {
  return a && b && dayKey(a) === dayKey(b);
}
function titleOf(item) {
  return item.title || item.request?.title || 'Oprava';
}
function idOf(item) {
  return item.requestId || item.id || item._id;
}
export default function RepairsCalendarPage() {
  const { session } = useAuth();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState(() => new Date());
  const [mode, setMode] = useState('month');
  async function load(signal) {
    if (!session?.token) {
      setError('Pro zobrazení kalendáře se musíte přihlásit.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/volunteer/repairs`, {
        headers: { Authorization: `Bearer ${session.token}` },
        signal,
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401)
        throw new Error('Přihlášení vypršelo. Přihlaste se prosím znovu.');
      if (response.status === 403) throw new Error('Kalendář je dostupný pouze dobrovolníkovi.');
      if (!response.ok) throw new Error(data.message || 'Kalendář se nepodařilo načíst.');
      const rows = Array.isArray(data) ? data : data.repairs;
      if (!Array.isArray(rows)) throw new Error('Server vrátil neočekávaný formát oprav.');
      setRepairs(rows);
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message || 'Nepodařilo se spojit se serverem.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }
  useEffect(() => {
    const c = new AbortController();
    load(c.signal);
    return () => c.abort();
  }, [session?.token]);
  const events = useMemo(
    () =>
      repairs
        .map((item) => ({ item, date: getDate(item), end: getEnd(item, getDate(item)) }))
        .filter(
          (x) =>
            x.date &&
            ![
              'completed',
              'done',
              'closed',
              'finished',
              'uzavreno',
              'dokončeno',
              'dokonceno',
            ].includes(String(x.item.status || x.item.state || '').toLowerCase()),
        ),
    [repairs],
  );
  const heading =
    mode === 'month'
      ? monthFormatter.format(cursor)
      : mode === 'week'
        ? `Týden ${new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'long' }).format(startOfWeek(cursor))} – ${new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(startOfWeek(cursor).getTime() + 6 * 86400000))}`
        : new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'full' }).format(cursor);
  function shift(amount) {
    const next = new Date(cursor);
    if (mode === 'month') next.setMonth(next.getMonth() + amount);
    else if (mode === 'week') next.setDate(next.getDate() + amount * 7);
    else next.setDate(next.getDate() + amount);
    setCursor(next);
  }
  const days = useMemo(() => {
    if (mode === 'day')
      return [new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate())];
    if (mode === 'week')
      return Array.from({ length: 7 }, (_, i) => {
        const d = startOfWeek(cursor);
        d.setDate(d.getDate() + i);
        return d;
      });
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = startOfWeek(first);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor, mode]);
  function eventsFor(date) {
    return events.filter((e) => sameDay(e.date, date)).sort((a, b) => a.date - b.date);
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
          <Link to="/requests">Dostupné opravy</Link>
          <Link to="/my-repairs">Moje opravy</Link>
          <span className="signed-in-label">
            {session?.user?.name || session?.user?.email || 'Dobrovolník'}
          </span>
        </nav>
      </header>
      <main className="calendar-page">
        <Link className="detail-back" to="/my-repairs">
          <ArrowLeft size={17} /> Zpět na moje opravy
        </Link>
        <div className="calendar-heading">
          <span className="eyebrow">DOBROVOLNICKÁ ZÓNA</span>
          <h1>Kalendář oprav</h1>
          <p>Přehled naplánovaných oprav</p>
        </div>
        <section className="repairs-calendar" aria-label="Kalendář naplánovaných oprav">
          <div className="calendar-toolbar">
            <div className="calendar-navigation">
              <button type="button" aria-label="Předchozí období" onClick={() => shift(-1)}>
                <ChevronLeft />
              </button>
              <button type="button" aria-label="Následující období" onClick={() => shift(1)}>
                <ChevronRight />
              </button>
              <button
                type="button"
                className="calendar-today"
                onClick={() => setCursor(new Date())}
              >
                Dnes
              </button>
            </div>
            <h2>{heading}</h2>
            <div className="calendar-modes" aria-label="Zobrazení kalendáře">
              {[
                ['month', 'Měsíc'],
                ['week', 'Týden'],
                ['day', 'Den'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={mode === value ? 'active' : ''}
                  aria-pressed={mode === value}
                  onClick={() => setMode(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="calendar-state">Načítám naplánované opravy…</div>
          ) : error ? (
            <div className="calendar-state calendar-error">
              <AlertCircle />
              <div>
                <strong>Kalendář se nepodařilo načíst</strong>
                <p>{error}</p>
                {!session?.token && (
                  <Link
                    className="button button-primary"
                    to="/login"
                    state={{ from: '/my-repairs/calendar' }}
                  >
                    Přihlásit se
                  </Link>
                )}
                <button className="button button-secondary" onClick={() => load()} type="button">
                  <RefreshCw size={16} /> Zkusit znovu
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={`calendar-grid calendar-${mode}`}>
                {mode !== 'day' &&
                  WEEKDAYS.map((day) => (
                    <div className="calendar-weekday" key={day}>
                      {day}
                    </div>
                  ))}
                {days.map((date) => {
                  const items = eventsFor(date);
                  const inMonth = date.getMonth() === cursor.getMonth();
                  return (
                    <div
                      key={dayKey(date)}
                      className={`calendar-cell ${mode === 'month' && !inMonth ? 'outside-month' : ''} ${sameDay(date, new Date()) ? 'is-today' : ''}`}
                    >
                      <button
                        type="button"
                        className="calendar-date"
                        onClick={() => {
                          setCursor(date);
                          setMode('day');
                        }}
                        aria-label={`Zobrazit ${date.toLocaleDateString('cs-CZ')}`}
                      >
                        {date.getDate()}
                      </button>
                      {items.map(({ item, date: eventDate, end }, i) => (
                        <Link
                          className="calendar-event"
                          key={idOf(item) || `${dayKey(date)}-${i}`}
                          to={`/requests/${encodeURIComponent(idOf(item) || '')}`}
                        >
                          <span>
                            {timeFormatter.format(eventDate)}
                            {end ? ` – ${timeFormatter.format(end)}` : ''}
                          </span>
                          <strong>{titleOf(item)}</strong>
                        </Link>
                      ))}
                      {mode === 'day' && items.length === 0 && (
                        <p className="calendar-no-events">
                          Na tento den není naplánována žádná oprava.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="calendar-legend">
                <span>
                  <i /> Naplánovaná oprava
                </span>
                <span>
                  <CalendarDays size={15} /> {events.length} naplánovaných oprav
                </span>
              </div>
            </>
          )}
        </section>
        {!loading && !error && events.length === 0 && (
          <div className="calendar-empty">
            <CalendarDays />
            <strong>Zatím nemáte žádné naplánované opravy</strong>
            <p>Až bude domluven termín opravy, zobrazí se zde v kalendáři.</p>
            <Link to="/requests" className="button button-primary">
              Prohlédnout dostupné opravy
            </Link>
          </div>
        )}
      </main>
      <footer className="request-footer">Repair Café · Komunitní opravy</footer>
    </div>
  );
}
