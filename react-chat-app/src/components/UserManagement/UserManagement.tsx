/**
 * Componente: Gestión de Usuarios (Admin)
 * 
 * Funcionalidades:
 * - Listar todos los usuarios en tabla
 * - Crear nuevo usuario (modal)
 * - Ver detalles de usuario
 * - Diseño responsive siguiendo UX de la app
 * 
 * Flujo de peticiones:
 * - GET /api/auth/users → API Gateway → Auth Service (lista usuarios)
 * - POST /api/auth/register → API Gateway → Auth Service (crea usuario)
 */

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './UserManagement.css';

// Tipos
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'user';
}

const UserManagement: React.FC = () => {
  // Estados
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateUserForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  /**
   * Cargar usuarios al montar el componente
   */
  useEffect(() => {
    fetchUsers();
  }, []);

  /**
   * Obtener lista de usuarios
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/auth/users');
      setUsers(response.data);
      
      console.log('✅ Usuarios cargados:', response.data.length);
    } catch (err: any) {
      console.error('❌ Error al cargar usuarios:', err);
      setError(err.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abrir modal de creación
   */
  const openModal = () => {
    setModalOpen(true);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user'
    });
    setFormError('');
  };

  /**
   * Cerrar modal
   */
  const closeModal = () => {
    setModalOpen(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user'
    });
    setFormError('');
  };

  /**
   * Manejar cambios en el formulario
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Validar formulario
   */
  const validateForm = (): boolean => {
    // Validar campos vacíos
    if (!formData.name.trim()) {
      setFormError('El nombre es requerido');
      return false;
    }
    
    if (!formData.email.trim()) {
      setFormError('El correo es requerido');
      return false;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('El correo no es válido');
      return false;
    }
    
    if (!formData.password) {
      setFormError('La contraseña es requerida');
      return false;
    }
    
    // Validar longitud de contraseña
    if (formData.password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    // Validar confirmación de contraseña
    if (formData.password !== formData.confirmPassword) {
      setFormError('Las contraseñas no coinciden');
      return false;
    }
    
    return true;
  };

  /**
   * Crear nuevo usuario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }
    
    try {
      setFormLoading(true);
      setFormError('');
      
      // Enviar petición al API Gateway
      const response = await api.post('/auth/register', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role
      });
      
      console.log('✅ Usuario creado:', response.data);
      
      // Recargar lista de usuarios
      await fetchUsers();
      
      // Cerrar modal
      closeModal();
      
    } catch (err: any) {
      console.error('❌ Error al crear usuario:', err);
      setFormError(err.response?.data?.error || 'Error al crear usuario');
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * Formato de fecha
   */
  const formatRole = (role: string) => {
    return role === 'admin' ? 'Administrador' : 'Usuario';
  };

  return (
    <div className="user-management">
      {/* Header */}
      <div className="users-header">
        <h2 className="users-title">Gestión de Usuarios</h2>
        <button className="btn-create-user" onClick={openModal}>
          Crear Usuario
        </button>
      </div>

      {/* Error global */}
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      ) : (
        /* Tabla de usuarios */
        <div className="users-table-container">
          {users.length === 0 ? (
            <div className="empty-state">
              <p>No hay usuarios registrados</p>
              <button className="btn-create-first" onClick={openModal}>
                Crear primer usuario
              </button>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {formatRole(user.role)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal de creación */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Registro de Usuarios</h3>
              <button className="btn-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <form className="user-form" onSubmit={handleSubmit}>
              {/* Nombre */}
              <div className="form-group">
                <label htmlFor="name">Nombre</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                  disabled={formLoading}
                  autoComplete="name"
                />
              </div>

              {/* Correo */}
              <div className="form-group">
                <label htmlFor="email">Correo</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="correo@ejemplo.com"
                  disabled={formLoading}
                  autoComplete="email"
                />
              </div>

              {/* Contraseña */}
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Mínimo 6 caracteres"
                  disabled={formLoading}
                  autoComplete="new-password"
                />
              </div>

              {/* Repetir Contraseña */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Repetir Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Repetir contraseña"
                  disabled={formLoading}
                  autoComplete="new-password"
                />
              </div>

              {/* Rol */}
              <div className="form-group">
                <label htmlFor="role">Rol</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={formLoading}
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {/* Error del formulario */}
              {formError && (
                <div className="form-error">
                  {formError}
                </div>
              )}

              {/* Botón de crear */}
              <button 
                type="submit" 
                className="btn-submit"
                disabled={formLoading}
              >
                {formLoading ? 'Creando...' : 'Crear'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
