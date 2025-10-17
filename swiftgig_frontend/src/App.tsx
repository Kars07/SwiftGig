import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Login from './components/auth/Login';
import EmailVerifyPage from './components/auth/EmailVerifyPage';
import TalentAuth from './components/auth/TalentAuth';
import ClientAuth from './components/auth/ClientAuth';
import { InitializeRegistry } from './components/auth/registry';
import CreateProfile from './components/auth/profilecreation';
import ClientDashboard from './pages/ClientDashboard/ClientDashboard';
import DashboardHome from './pages/ClientDashboard/DashboardHome';
import TalentDashboard from './pages/TalentDashboard/TalentDashboard';
import TalentDashboardHome from './pages/TalentDashboard/TalentDashboardHome';
import CreateGigs from './pages/ClientDashboard/CreateGigs';
import YourGigs from './pages/ClientDashboard/YourGigs';
import Disputes from './pages/ClientDashboard/Disputes';
import Gigs from './pages/TalentDashboard/Gigs';
import VotingPoll from './pages/TalentDashboard/VotingPoll';
import DashboardProfile from './pages/TalentDashboard/DashboardProfile';
import DashboardSettings from './pages/TalentDashboard/DashboardSettings';
import ClientProfile from './pages/ClientDashboard/ClientProfile';
import ClientSettings from './pages/ClientDashboard/ClientSettings';
import Submission from './pages/TalentDashboard/Submission';
import ReviewSubmission from './pages/ClientDashboard/ReviewSubmission';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Main layout wrapper with Navbar + Footer (only for landing page)
const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Routes WITH Navbar + Footer (Landing Page Only) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* ✅ Routes WITHOUT Navbar + Footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/initialize-registry" element={<InitializeRegistry />} />
        <Route path="/create-profile" element={<CreateProfile />} />
        <Route path="/verify" element={<EmailVerifyPage />} />
        <Route path="/talent-auth" element={<TalentAuth />} />
        <Route path="/client-auth" element={<ClientAuth />} />
        
        {/* Client Dashboard Routes */}
        <Route path="/client-dashboard/*" element={<ClientDashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="create-gigs" element={<CreateGigs />} />
          <Route path="your-gigs" element={<YourGigs />} /> 
          <Route path="disputes" element={<Disputes />} />
          <Route path="settings" element={<ClientSettings />} />
          <Route path="profile" element={<ClientProfile />} />
          <Route path="review-submissions" element={<ReviewSubmission />} />
        </Route>

        {/* Talent Dashboard Routes */}
        <Route path="/talent-dashboard/*" element={<TalentDashboard />}>
          <Route index element={<TalentDashboardHome />} />
          <Route path="gigs" element={<Gigs />} />
          <Route path="voting-poll" element={<VotingPoll />} />
          <Route path="settings" element={<DashboardSettings />} />
          <Route path="profile" element={<DashboardProfile />} />
          <Route path="submissions" element={<Submission />} />
        </Route>
      </Routes>
    </Router>
  );
}