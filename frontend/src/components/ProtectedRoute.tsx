import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, token } = useAuthStore();
  const location = useLocation();

  // Überprüfe ob der Benutzer eingeloggt ist
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Überprüfe ob der Benutzer die erforderliche Rolle hat
  if (allowedRoles && (!user.role || !allowedRoles.includes(user.role))) {
    console.log('Access denied: User role', user.role, 'not in allowed roles:', allowedRoles);
    // Redirect zum entsprechenden Dashboard basierend auf der Rolle
    const dashboardRoutes = {
      [UserRole.VERMIETER]: '/vermieter/dashboard',
      [UserRole.MIETER]: '/mieter/dashboard',
      [UserRole.HANDWERKER]: '/handwerker/dashboard',
    };
    
    // Make sure we have a valid role before redirecting
    const redirectPath = user.role && dashboardRoutes[user.role] 
      ? dashboardRoutes[user.role] 
      : '/login';
      
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
