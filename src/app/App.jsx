import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from '../pages/LandingPage.jsx';
import CreateRequestPage from '../pages/CreateRequestPage.jsx';
import RequestsPage from '../pages/RequestsPage.jsx';
import RequestDetailPage from '../pages/RequestDetailPage.jsx';
import RequestInterestsPage from '../pages/RequestInterestsPage.jsx';
import MyRepairsPage from '../pages/MyRepairsPage.jsx';
import RepairsCalendarPage from '../pages/RepairsCalendarPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/requests/new" element={<CreateRequestPage />} />
      <Route path="/requests" element={<RequestsPage />} />
      <Route path="/requests/:id" element={<RequestDetailPage />} />
      <Route path="/requests/:id/interests" element={<RequestInterestsPage />} />
      <Route path="/my-repairs" element={<MyRepairsPage />} />
      <Route path="/my-repairs/calendar" element={<RepairsCalendarPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
