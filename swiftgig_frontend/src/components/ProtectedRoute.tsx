import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'Client' | 'Talent';
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const location = useLocation();
  
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = userData.userId || '';
  const userRole = userData.role || '';

  // Check if user is authenticated and has correct role
  if (!userId) {
    // Redirect to login if not authenticated, save attempted path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role check is required and role doesn't match
  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;