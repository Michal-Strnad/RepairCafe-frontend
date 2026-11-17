import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from '../pages/LandingPage.jsx';
import CreateRequestPage from '../pages/CreateRequestPage.jsx';

function LoginPlaceholder() {
  return (
    <main className="intro" style={{ minHeight: '60vh' }}>
      <span className="eyebrow">PŘIPRAVUJEME</span>
      <h2>Přihlášení bude doplněno v další části projektu.</h2>
      <p>V této fázi je dostupná veřejná úvodní stránka Repair Café.</p>
      <a className="button button-primary" href="/">Zpět na úvodní stránku</a>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/requests/new" element={<CreateRequestPage />} />
      <Route path="/login" element={<LoginPlaceholder />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
