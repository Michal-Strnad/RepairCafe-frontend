import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Search, Users, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const roleLabels = { admin: 'Administrátor', volunteer: 'Dobrovolník', user: 'Uživatel' };

export default function AdminUsersPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token || session?.user?.role !== 'admin') return;
    const controller = new AbortController();
    async function loadUsers() {
      setLoading(true);
      setError('');
      try {
        // Backend exposes this operation as POST /userSettings/getUsers.
        const response = await fetch(`${API_URL}/userSettings/getUsers`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.token}` },
          signal: controller.signal,
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.message || `Načtení uživatelů selhalo (${response.status}).`);
        }
        if (!Array.isArray(data))
          throw new Error('Server vrátil neočekávaný formát seznamu uživatelů.');
        setUsers(data);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Uživatele se nepodařilo načíst.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadUsers();
    return () => controller.abort();
  }, [session]);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('cs');
    if (!normalized) return users;
    return users.filter((user) =>
      `${user.name || ''} ${user.email || ''} ${user.role || ''} ${user.id || ''}`
        .toLocaleLowerCase('cs')
        .includes(normalized),
    );
  }, [users, query]);

  if (!session?.token) return <Navigate to="/login" replace />;
  if (session?.user?.role !== 'admin') return <Navigate to="/" replace />;

  return (
    <div className="admin-users-page">
      <header className="admin-users-header">
        <Link className="brand" to="/">
          <span className="brand-mark">
            <Users />
          </span>
          <b>Repair Café</b>
        </Link>
        <Link to="/" className="admin-back-link">
          <ArrowLeft size={17} /> Zpět na úvod
        </Link>
      </header>
      <main className="admin-users-content">
        <div className="admin-users-heading">
          <div>
            <span className="eyebrow">SPRÁVA PLATFORMY</span>
            <h1>Uživatelé</h1>
            <p>Přehled registrovaných uživatelů a jejich rolí.</p>
          </div>
          <div className="admin-users-total">
            <Users size={19} />
            <strong>{users.length}</strong>
            <span>uživatelů</span>
          </div>
        </div>

        <label className="admin-users-search">
          <Search size={19} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Hledat podle jména, e-mailu, role nebo ID…"
          />
        </label>

        {loading ? (
          <div className="admin-users-state">Načítám uživatele…</div>
        ) : error ? (
          <div className="admin-users-error" role="alert">
            <p>{error}</p>
            <button className="button button-secondary" onClick={() => window.location.reload()}>
              <RefreshCw size={16} /> Zkusit znovu
            </button>
          </div>
        ) : filteredUsers.length ? (
          <div className="admin-users-table-wrap">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Uživatel</th>
                  <th>E-mail</th>
                  <th>Role</th>
                  <th>ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-user-identity">
                        {user.picture ? (
                          <img src={user.picture} alt="" />
                        ) : (
                          <span className="admin-user-avatar">
                            {(user.name || '?').slice(0, 1).toLocaleUpperCase('cs')}
                          </span>
                        )}
                        <strong>{user.name || 'Bez jména'}</strong>
                      </div>
                    </td>
                    <td>{user.email || '—'}</td>
                    <td>
                      <span className={`admin-user-role role-${user.role || 'unknown'}`}>
                        {roleLabels[user.role] || user.role || 'Neznámá role'}
                      </span>
                    </td>
                    <td className="admin-user-id">{user.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="admin-users-result-count">
              Zobrazeno {filteredUsers.length} z {users.length} uživatelů
            </div>
          </div>
        ) : (
          <div className="admin-users-empty">
            <ShieldCheck size={28} />
            <h2>
              {users.length
                ? 'Žádní uživatelé neodpovídají hledání'
                : 'Zatím zde nejsou žádní uživatelé'}
            </h2>
            <p>
              {users.length
                ? 'Zkuste změnit hledaný výraz.'
                : 'Seznam se zobrazí po registraci uživatelů.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
