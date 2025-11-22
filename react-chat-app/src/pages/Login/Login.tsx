/**
 * Vista de Login
 * 
 * Diseño basado en la imagen proporcionada:
 * - Fondo gris claro
 * - Card centrado con bordes redondeados
 * - Campos: Correo y Contraseña
 * - Botón: "Iniciar Sesion"
 * 
 * Flujo:
 * 1. Usuario ingresa email y contraseña
 * 2. Submit → authService.login()
 * 3. Si exitoso y admin → /admin
 * 4. Si exitoso y user → /dashboard
 * 5. Si error → mostrar mensaje
 */

import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Manejar submit del formulario
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Limpiar error previo
    setError('');
    
    // Validación básica
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    setLoading(true);
    
    try {
      // Llamar al servicio de autenticación
      const { user } = await authService.login({ email, password });
      
      console.log(`[Login] Sesión iniciada: ${user.name} (${user.role})`);
      
      // Redirigir según el rol
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      // Manejar errores
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          'Error al iniciar sesión. Verifica tus credenciales.';
      
      setError(errorMessage);
      console.error('[Login] Error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Campos del formulario */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Campo: Correo */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Correo
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=""
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>

          {/* Campo: Contraseña */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contaseña
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              disabled={loading}
              autoComplete="current-password"
              required
            />
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Botón de submit */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesion'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
