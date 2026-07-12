import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface RouteGuardProps {
  allowedRoles?: string[];
}

const RouteGuard: React.FC<RouteGuardProps> = ({ allowedRoles }) => {
  const token = localStorage.getItem('accessToken');
  const userJson = localStorage.getItem('user');

  if (!token || !userJson) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userJson);

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to dashboard if user has invalid role for page
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default RouteGuard;
