/**
 * ProfileView Component
 * Muestra perfil del usuario con estadísticas y cambio de contraseña
 */

import React, { useEffect, useState } from 'react';
import authService from '../../services/authService';
import userStatsService, { UserStats } from '../../services/userStatsService';
import passwordService from '../../services/passwordService';
import './ProfileView.css';

const ProfileView: React.FC = () => {
  const currentUser = authService.getCurrentUser();
  
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Estado del formulario de cambio de contraseña
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const data = await userStatsService.getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validaciones
    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    try {
      setChangingPassword(true);
      await passwordService.changePassword({
        currentPassword,
        newPassword
      });
      
      setPasswordSuccess('Contraseña actualizada exitosamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error: any) {
      setPasswordError(error.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="profile-view">
      <h2 className="profile-title">Mi Perfil</h2>

      {/* Información del Usuario */}
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {currentUser?.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h3>{currentUser?.name}</h3>
            <p className="profile-email">{currentUser?.email}</p>
            <span className={`profile-role ${currentUser?.role}`}>
              {currentUser?.role === 'admin' ? 'Administrador' : 'Usuario'}
            </span>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="profile-stats">
          <h4>Estadísticas</h4>
          {loadingStats ? (
            <p className="loading-text">Cargando estadísticas...</p>
          ) : (
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{stats?.projectsCount || 0}</span>
                <span className="stat-label">Proyectos</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats?.tasksCount || 0}</span>
                <span className="stat-label">Tareas</span>
              </div>
            </div>
          )}
        </div>

        {/* Lista de Proyectos */}
        {stats && stats.projects.length > 0 && (
          <div className="profile-projects">
            <h4>Mis Proyectos</h4>
            <div className="projects-list">
              {stats.projects.map((project) => (
                <div key={project._id} className="project-item">
                  <span className="project-name">{project.name}</span>
                  <span className={`project-role ${project.role}`}>
                    {project.role === 'owner' ? 'Propietario' : 'Miembro'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón Cambiar Contraseña */}
        <div className="profile-actions">
          <button
            className="btn-change-password"
            onClick={() => setShowChangePassword(!showChangePassword)}
          >
            {showChangePassword ? 'Cancelar' : 'Cambiar Contraseña'}
          </button>
        </div>

        {/* Formulario de Cambio de Contraseña */}
        {showChangePassword && (
          <div className="change-password-form">
            <h4>Cambiar Contraseña</h4>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Contraseña Actual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={changingPassword}
                />
              </div>

              <div className="form-group">
                <label>Nueva Contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={changingPassword}
                />
              </div>

              <div className="form-group">
                <label>Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={changingPassword}
                />
              </div>

              {passwordError && (
                <div className="error-message">{passwordError}</div>
              )}

              {passwordSuccess && (
                <div className="success-message">{passwordSuccess}</div>
              )}

              <button
                type="submit"
                className="btn-submit"
                disabled={changingPassword}
              >
                {changingPassword ? 'Guardando...' : 'Guardar Contraseña'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
