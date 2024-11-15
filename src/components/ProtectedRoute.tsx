import { useEffect } from 'react';
import { getAuthUser } from '../lib/auth';
import { toast } from 'react-hot-toast';

// Mapeo de roles a IDs según la base de datos
export const ROLES = {
  ADMIN: 1,    // Cambio de 4 a 1
  USUARIO: 2,  // Cambio de 1 a 2
  EDITOR: 3,   // Se mantiene en 3
  ESCRITOR: 4, // Cambio de 2 a 4
};

interface ProtectedRouteProps {
  allowedRoles: number[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  useEffect(() => {
    const user = getAuthUser();
    
    if (!user) {
      toast.error('Debes iniciar sesión para acceder a esta página');
      window.location.href = '/login';
      return;
    }

    if (!allowedRoles.includes(user.rol_id)) {
      toast.error('No tienes permisos para acceder a esta página');
      window.location.href = '/';
      return;
    }
  }, [allowedRoles]);

  return <>{children}</>;
};