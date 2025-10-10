import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SwiftGigSignUp from './components/auth/SwiftGigSignUp';
import EmailVerifyPage from './components/auth/EmailVerifyPage';
import TalentAuth from './components/auth/TalentAuth';
import ClientAuth from './components/auth/ClientAuth';
import RegisterFlow1 from './components/auth/RegisterFlow1';
import RegisterFlow2 from './components/auth/RegisterFlow2';
import ClientDashboard from './pages/ClientDashboard/ClientDashboard';
import DashboardHome from './pages/ClientDashboard/DashboardHome';
import TalentDashboard from './pages/TalentDashboard/TalentDashboard';
import TalentDashboardHome from './pages/TalentDashboard/TalentDashboardHome';
import CreateGigs from './pages/ClientDashboard/CreateGigs';
import YourGigs from './pages/ClientDashboard/YourGigs';
import Disputes from './pages/ClientDashboard/Disputes';
// import DashboardSettings from './pages/ClientDashboard/DashboardSettings';
// import DashboardProfile from './pages/ClientDashboard/DashboardProfile';

function LandingPage() {
  return (
     <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-black mb-4">SwiftGig</h1>
        <p className="text-xl text-gray-600 mb-8">Your freelancing platform</p>
        <a
          href="/signup"
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
        <Route path="/signup" element={<SwiftGigSignUp />} />
        <Route path="/verify" element={<EmailVerifyPage />} />
        <Route path="/talent-auth" element={<TalentAuth />} />
        <Route path="/client-auth" element={<ClientAuth />} />
        <Route path="/register/client" element={<RegisterFlow1 />} />
        <Route path="/register/talent" element={<RegisterFlow2 />} />
        
        {/* Client Dashboard Routes */}
        <Route path="/client-dashboard/*" element={<ClientDashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="create-gigs" element={<CreateGigs />} />
          <Route path="your-gigs" element={<YourGigs />} /> 
          <Route path="disputes" element={<Disputes />} />
          {/* <Route path="settings" element={<DashboardSettings />} /> */}
          {/* <Route path="profile" element={<DashboardProfile />} /> */}
        </Route>

        {/* Talent Dashboard Routes */}
        <Route path="/talent-dashboard/*" element={<TalentDashboard />}>
          <Route index element={<TalentDashboardHome />} />
          {/* <Route path="create-gigs" element={<CreateGigs />} /> */}
          {/* <Route path="your-gigs" element={<YourGigs />} /> */}
          {/* <Route path="voting-poll" element={<VotingPoll />} /> */}
          {/* <Route path="settings" element={<DashboardSettings />} /> */}
          {/* <Route path="profile" element={<DashboardProfile />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}