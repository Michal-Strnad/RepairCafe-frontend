import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, CalendarDays, CheckCircle2, Clock3, Coffee, AlertCircle,
  Wrench, UserRound, ClipboardList, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

function dateLabel(value) {
  if (!value) return 'Termín zatím není uveden';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'medium' }).format(date);
}

function getStatus(item) {
  const raw = String(item.status || item.state || '').toLowerCase();
  if (['completed', 'done', 'closed', 'finished', 'uzavreno', 'dokončeno', 'dokonceno'].includes(raw)) return 'completed';
  return 'planned';
}

function getRepairDate(item) {
  return item.scheduledAt || item.scheduledDate || item.repairDate || item.date || item.appointment?.start || null;
}

function getRequester(item) {
  return item.requester?.name || item.customer?.name || item.owner?.name || item.requesterName || item.customerName || 'Zadavatel';
}

export default function MyRepairsPage() {
  const { session } = useAuth();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('planned');

  async function loadRepairs(signal) {
    if (!session?.token) {
      setError('Pro zobrazení vlastních oprav se musíte přihlásit.');
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
      if (response.status === 401) throw new Error('Přihlášení vypršelo. Přihlaste se prosím znovu.');
      if (response.status === 403) throw new Error('Přehled oprav je dostupný pouze uživateli s rolí dobrovolníka.');
      if (response.status === 404) throw new Error('Přehled vašich oprav nebyl nalezen. Ověřte prosím napojení backendu.');
      if (!response.ok) throw new Error(data.message || 'Opravy se nepodařilo načíst.');
      const rows = Array.isArray(data) ? data : data.repairs;
      if (!Array.isArray(rows)) throw new Error('Server vrátil neočekávaný formát přehledu oprav.');
      setRepairs(rows);
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message || 'Nepodařilo se spojit se serverem.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    loadRepairs(controller.signal);
    return () => controller.abort();
  }, [session?.token]);

  const planned = useMemo(() => repairs.filter((item) => getStatus(item) === 'planned'), [repairs]);
  const completed = useMemo(() => repairs.filter((item) => getStatus(item) === 'completed'), [repairs]);
  const visible = filter === 'planned' ? planned : completed;

  return (
    <div className="browse-page">
      <header className="browse-header">
        <Link className="brand" to="/"><span className="brand-mark"><Coffee /></span><b>Repair Café</b></Link>
        <nav>
          <Link to="/requests">Dostupné opravy</Link>
          <span className="signed-in-label">{session?.user?.name || session?.user?.email || 'Dobrovolník'}</span>
        </nav>
      </header>
      <main className="my-repairs-content">
        <Link className="detail-back" to="/requests"><ArrowLeft size={17} /> Zpět na dostupné opravy</Link>
        <div className="my-repairs-heading">
          <span className="eyebrow">DOBROVOLNICKÁ ZÓNA</span>
          <h1>Moje opravy</h1>
          <p>Na jednom místě najdete opravy, které jste přijali, i ty, které už máte za sebou.</p>
        </div>

        <div className="my-repairs-calendar-link"><Link className="button button-secondary" to="/my-repairs/calendar"><CalendarDays size={17} /> Otevřít kalendář oprav</Link></div>

        <div className="my-repairs-stats">
          <div><CalendarDays /><strong>{planned.length}</strong><span>naplánované opravy</span></div>
          <div><CheckCircle2 /><strong>{completed.length}</strong><span>dokončené opravy</span></div>
        </div>

        <div className="my-repairs-tabs" role="tablist" aria-label="Typ oprav">
          <button type="button" role="tab" aria-selected={filter === 'planned'} className={filter === 'planned' ? 'active' : ''} onClick={() => setFilter('planned')}>
            <Clock3 size={17} /> Naplánované <span>{planned.length}</span>
          </button>
          <button type="button" role="tab" aria-selected={filter === 'completed'} className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>
            <CheckCircle2 size={17} /> Dokončené <span>{completed.length}</span>
          </button>
        </div>

        {loading ? (
          <div className="my-repairs-state" role="status">Načítám vaše opravy…</div>
        ) : error ? (
          <div className="interests-message interests-message-error" role="alert">
            <AlertCircle size={20} /><div><strong>Přehled oprav se nepodařilo načíst</strong><p>{error}</p>
              {!session?.token && <Link className="button button-primary" to="/login" state={{ from: '/my-repairs' }}>Přihlásit se</Link>}
              <button className="button button-secondary" type="button" onClick={() => loadRepairs()}><RefreshCw size={16} /> Zkusit znovu</button>
            </div>
          </div>
        ) : visible.length === 0 ? (
          <div className="my-repairs-empty">
            {filter === 'planned' ? <CalendarDays size={34} /> : <CheckCircle2 size={34} />}
            <h2>{filter === 'planned' ? 'Zatím nemáte žádné naplánované opravy' : 'Zatím nemáte žádné dokončené opravy'}</h2>
            <p>{filter === 'planned' ? 'Až si vás zákazník vybere a domluvíte termín opravy, zobrazí se zde.' : 'Po dokončení opravy ji zde najdete spolu s jejím výsledkem.'}</p>
            {filter === 'planned' && <Link className="button button-primary" to="/requests">Prohlédnout dostupné opravy</Link>}
          </div>
        ) : (
          <div className="my-repairs-list">
            {visible.map((item, index) => {
              const id = item.id || item._id || item.requestId;
              const title = item.title || item.request?.title || 'Požadavek na opravu';
              const category = item.category?.name || item.category || item.request?.category?.name || item.request?.category || 'Nezařazeno';
              const repairDate = getRepairDate(item);
              return (
                <article className="my-repair-card" key={id || index}>
                  <div className="my-repair-icon"><Wrench size={22} /></div>
                  <div className="my-repair-main">
                    <div className="my-repair-top"><span className="category-label">{category}</span>
                      <span className={`status ${filter === 'planned' ? 'status-open' : 'status-completed'}`}>{filter === 'planned' ? 'Naplánováno' : 'Dokončeno'}</span>
                    </div>
                    <h2>{title}</h2>
                    <div className="my-repair-meta"><span><UserRound size={15} /> {getRequester(item)}</span><span><CalendarDays size={15} /> {dateLabel(repairDate)}</span></div>
                    <div className="my-repair-footer">
                      <span>{filter === 'planned' ? 'Termín opravy' : 'Datum opravy'}</span>
                      {id ? <Link to={`/requests/${encodeURIComponent(item.requestId || id)}`}>Zobrazit detail <ClipboardList size={16} /></Link> : <span>Detail není dostupný</span>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <footer className="request-footer">Repair Café · Komunitní opravy</footer>
    </div>
  );
}
