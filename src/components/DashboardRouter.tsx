import React, { useEffect, useState } from 'react';
import { getAuthUser } from '../lib/auth';
import { ROLES } from './ProtectedRoute';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { EditorDashboard } from './dashboards/EditorDashboard';
import { WriterDashboard } from './dashboards/WriterDashboard';
import { UserDashboard } from './dashboards/UserDashboard';

export const DashboardRouter: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const authUser = getAuthUser();
    if (!authUser) {
      window.location.href = '/login';
      return;
    }
    setUser(authUser);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>;
  }

  switch (user?.rol_id) {
    case ROLES.ADMIN:
      return <AdminDashboard user={user} />;
    case ROLES.EDITOR:
      return <EditorDashboard user={user} />;
    case ROLES.ESCRITOR:
      return <WriterDashboard user={user} />;
    case ROLES.USUARIO:
      return <UserDashboard user={user} />;
    default:
      window.location.href = '/login';
      return null;
  }
};