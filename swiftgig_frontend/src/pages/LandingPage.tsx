import React from 'react';
import { useNavigate } from 'react-router-dom';
import FirstSection from '../components/FirstSection';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/create-profile');
  };

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <FirstSection onGetStarted={handleGetStarted} />
    </div>
  );
}
