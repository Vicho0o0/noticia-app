export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol_id: number;
}

export const setAuthUser = (user: User) => {
  if (typeof window !== 'undefined') {
    // Guardar en localStorage
    localStorage.setItem('authToken', JSON.stringify(user));
    // Guardar en cookie con una duración de 7 días
    const date = new Date();
    date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
    document.cookie = `authToken=${JSON.stringify(user)}; expires=${date.toUTCString()}; path=/`;
  }
};

export const getAuthUser = (): User | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    // Intentar obtener del localStorage primero
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      return JSON.parse(authToken);
    }

    // Si no está en localStorage, buscar en las cookies
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('authToken='));
    if (authCookie) {
      const authData = authCookie.split('=')[1];
      // Si se encuentra en la cookie, sincronizar con localStorage
      localStorage.setItem('authToken', authData);
      return JSON.parse(authData);
    }

    return null;
  } catch (error) {
    console.error('Error parsing auth user:', error);
    return null;
  }
};

export const removeAuthUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
};