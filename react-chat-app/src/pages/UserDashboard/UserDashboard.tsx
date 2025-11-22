/**
 * Vista de Usuario
 * 
 * Características:
 * - Muestra solo los proyectos asignados al usuario
 * - Interface más simple (sin opciones de administración)
 * - No puede crear/eliminar proyectos
 * - Puede ver tareas del proyecto asignado
 * 
 * Funcionalidades:
 * - Ver proyectos asignados
 * - Ver detalles de tareas
 * - Actualizar estado de tareas
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import projectService, { Project } from '../../services/projectService';
import ProfileView from '../../components/ProfileView/ProfileView';
import './UserDashboard.css';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  
  // Estados
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  /**
   * Cargar proyectos asignados al usuario
   */
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error cargando proyectos:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  /**
   * Toggle menú
   */
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  /**
   * Ver detalles del proyecto
   */
  const handleViewProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="user-dashboard">
      {/* Header */}
      <header className="user-header">
        <div className="header-content">
          <h1 className="header-title">Mis Proyectos</h1>
          
          {/* Botón de menú */}
          <button 
            className="menu-toggle"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <div className="menu-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>

          {/* Menú desplegable */}
          {menuOpen && (
            <nav className="dropdown-menu">
              <div className="menu-user-info">
                <p className="menu-user-name">{user?.name || 'Usuario'}</p>
                <p className="menu-user-email">{user?.email || ''}</p>
              </div>
              <div className="menu-divider"></div>
              <button
                className="menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  setShowProfile(true);
                }}
              >
                Mi Perfil
              </button>
              <button
                className="menu-item logout"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Contenido principal */}
      <main className="user-main">
        {showProfile ? (
          <div className="profile-section">
            <button 
              className="btn-back"
              onClick={() => setShowProfile(false)}
            >
              ← Volver a Proyectos
            </button>
            <ProfileView />
          </div>
        ) : loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Cargando proyectos...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <h2>No tienes proyectos asignados</h2>
            <p>Contacta a tu administrador para ser asignado a un proyecto.</p>
          </div>
        ) : (
          <div className="projects-container">
            <h2 className="projects-title">Proyectos Asignados</h2>
            
            {projects.length === 0 ? (
              <div className="empty-projects">
                <p>No tienes proyectos asignados.</p>
                <p className="empty-hint">Cuando se te asigne un proyecto, aparecerá aquí.</p>
              </div>
            ) : (
              <div className="projects-grid">
                {projects.map((project) => (
                  <UserProjectCard
                    key={project._id}
                    project={project}
                    onView={() => handleViewProject(project._id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

/**
 * Componente: Card de Proyecto para Usuario
 * Versión simplificada sin opciones de edición/eliminación
 */
interface UserProjectCardProps {
  project: Project;
  onView: () => void;
}

const UserProjectCard: React.FC<UserProjectCardProps> = ({ project, onView }) => {
  return (
    <div className="user-project-card">
      <div className="card-header">
        <h3 className="card-title">{project.name}</h3>
      </div>
      
      <p className="card-description">{project.description}</p>
      
      <div className="card-footer">
        {project.clientName && (
          <span className="card-manager">{project.clientName}</span>
        )}
        <button 
          className="btn-view-project"
          onClick={onView}
        >
          Ver Tareas
        </button>
      </div>
    </div>
  );
};

export default UserDashboard;
