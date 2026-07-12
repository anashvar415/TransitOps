import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RouteGuardProps {
  allowedRoles?: string[];
}

const RouteGuard: React.FC<RouteGuardProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to a safe default page based on role to prevent infinite redirect loops
    if (user.role === 'DRIVER' || user.role === 'SAFETY_OFFICER') {
      return <Navigate to="/vehicles" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default RouteGuard;
