import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConnectButton } from "@mysten/dapp-kit";
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
import Gigs from './pages/TalentDashboard/Gigs'
import VotingPoll from './pages/TalentDashboard/VotingPoll'
import DashboardProfile from './pages/TalentDashboard/DashboardProfile'
import DashboardSettings from './pages/TalentDashboard/DashboardSettings'
import ClientProfile from './pages/ClientDashboard/ClientProfile';
import ClientSettings from './pages/ClientDashboard/ClientSettings';
import Submission from './pages/TalentDashboard/Submission';
import ReviewSubmission from './pages/ClientDashboard/ReviewSubmission';


function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white relative">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">SwiftGig</h1>
          
          <div style={{
            padding: '4px',
            background: 'rgba(98, 37, 120, 0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(98, 37, 120, 0.2)'
          }}>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="text-center pt-20">
        <h2 className="text-5xl font-bold text-black mb-4">SwiftGig</h2>
        <p className="text-xl text-gray-600 mb-8">Your freelancing platform</p>
        <a
          href="/create-profile"
          className="inline-block px-8 py-3 bg-[#622578] text-white rounded-full font-medium hover:bg-[#622578]/90 transition-all"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login/>} />
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