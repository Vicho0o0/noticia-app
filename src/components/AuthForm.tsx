import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { setAuthUser } from '../lib/auth';
import { z } from 'zod';

// Esquema de validación para el registro
const registerSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  contraseña: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// Esquema de validación para el login
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  contraseña: z.string().min(1, 'La contraseña es requerida'),
});

interface AuthFormProps {
  type: 'login' | 'register';
}

export const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  // Estado inicial del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    contraseña: '',
  });

  // Manejador de cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Función para manejar el registro de usuarios
  const handleRegister = async () => {
    try {
      // Validar datos del formulario
      registerSchema.parse(formData);

      // Verificar si el email ya existe
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        toast.error('Este email ya está registrado');
        return;
      }

      // Insertar nuevo usuario
      const { data: newUser, error } = await supabase
        .from('usuarios')
        .insert([
          {
            ...formData,
            rol_id: 1, // Role por defecto: usuario normal
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('¡Registro exitoso!');
      setAuthUser(newUser);
      window.location.href = '/';

    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          toast.error(err.message);
        });
      } else {
        console.error('Error en registro:', error);
        toast.error('Error al registrar usuario');
      }
    }
  };

  // Función para manejar el login
  const handleLogin = async () => {
    try {
      // Validar datos del formulario
      loginSchema.parse(formData);

      // Buscar usuario
      const { data: user, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', formData.email)
        .eq('contraseña', formData.contraseña)
        .single();

      if (error || !user) {
        toast.error('Credenciales inválidas');
        return;
      }

      toast.success('¡Bienvenido!');
      setAuthUser(user);
      window.location.href = '/';

    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          toast.error(err.message);
        });
      } else {
        console.error('Error en login:', error);
        toast.error('Error al iniciar sesión');
      }
    }
  };

  return (
    <div className="space-y-4">
      {type === 'register' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Apellido</label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              required
            />
          </div>
        </>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
        <input
          type="password"
          name="contraseña"
          value={formData.contraseña}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          required
        />
      </div>
      <button
        onClick={type === 'login' ? handleLogin : handleRegister}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        {type === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
      </button>
      <div className="text-center text-sm text-gray-600">
        {type === 'login' ? (
          <p>
            ¿No tienes cuenta?{' '}
            <a href="/register" className="text-red-600 hover:text-red-500">
              Regístrate
            </a>
          </p>
        ) : (
          <p>
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="text-red-600 hover:text-red-500">
              Inicia sesión
            </a>
          </p>
        )}
      </div>
    </div>
  );
};