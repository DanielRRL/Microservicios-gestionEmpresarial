/**
 * Vista de Administrador
 * 
 * Diseño basado en la segunda imagen:
 * - Header con menú desplegable en la esquina superior derecha
 * - Menú con opciones: Admin, Proyectos, Inventario, Usuarios, Perfil, IA
 * - Vista principal: Listado de proyectos con botón "NUEVO PROYECTO"
 * - Cards de proyectos con nombre, descripción y menú de opciones (3 puntos)
 * 
 * Funcionalidades:
 * - Ver todos los proyectos
 * - Crear nuevo proyecto
 * - Editar/Eliminar proyectos
 * - Navegar entre secciones del menú
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import projectService, { Project, CreateProjectData } from '../../services/projectService';
import UserManagement from '../../components/UserManagement/UserManagement';
import ProfileView from '../../components/ProfileView/ProfileView';
import './AdminDashboard.css';

// Tipos de secciones del admin
type AdminSection = 'proyectos' | 'inventario' | 'usuarios' | 'perfil' | 'ia';

// Tipo de modal
type ModalType = 'create' | 'edit' | 'delete' | null;

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados
  const [currentSection, setCurrentSection] = useState<AdminSection>('proyectos');
  const [menuOpen, setMenuOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para modales
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Estados para formulario
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    description: '',
    clientName: ''
  });
  const [deletePassword, setDeletePassword] = useState('');
  const [error, setError] = useState('');

  /**
   * Cargar proyectos al montar el componente o al cambiar a sección proyectos
   */
  useEffect(() => {
    if (currentSection === 'proyectos') {
      loadProjects();
    }
  }, [currentSection]);

  /**
   * Cargar lista de proyectos
   */
  const loadProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await projectService.getAllProjects();
      setProjects(data);
    } catch (err: any) {
      setError('Error al cargar proyectos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abrir modal de crear proyecto
   */
  const handleOpenCreateModal = () => {
    setFormData({ name: '', description: '', clientName: '' });
    setModalType('create');
    setError('');
  };

  /**
   * Abrir modal de editar proyecto
   */
  const handleOpenEditModal = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      clientName: project.clientName
    });
    setModalType('edit');
    setError('');
  };

  /**
   * Abrir modal de eliminar proyecto
   */
  const handleOpenDeleteModal = (project: Project) => {
    setSelectedProject(project);
    setDeletePassword('');
    setModalType('delete');
    setError('');
  };

  /**
   * Cerrar modal
   */
  const handleCloseModal = () => {
    setModalType(null);
    setSelectedProject(null);
    setFormData({ name: '', description: '', clientName: '' });
    setDeletePassword('');
    setError('');
  };

  /**
   * Manejar cambio en formulario
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Crear proyecto
   */
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.description || !formData.clientName) {
      setError('Todos los campos son requeridos');
      return;
    }

    try {
      await projectService.createProject(formData);
      await loadProjects();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear proyecto');
    }
  };

  /**
   * Actualizar proyecto
   */
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedProject) return;

    try {
      await projectService.updateProject(selectedProject._id, formData);
      await loadProjects();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar proyecto');
    }
  };

  /**
   * Eliminar proyecto
   */
  const handleDeleteProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedProject) return;

    // Verificar contraseña de admin
    const user = authService.getCurrentUser();
    if (!user || deletePassword !== 'admin123') {
      setError('Contraseña de administrador incorrecta');
      return;
    }

    try {
      await projectService.deleteProject(selectedProject._id);
      await loadProjects();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al eliminar proyecto');
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
   * Cambiar de sección
   */
  const handleSectionChange = (section: AdminSection) => {
    // Si es IA, navegar a la ruta /ai
    if (section === 'ia') {
      navigate('/ai');
      return;
    }
    
    setCurrentSection(section);
    setMenuOpen(false);
  };

  /**
   * Toggle menú
   */
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="admin-dashboard">
      {/* Header con menú desplegable */}
      <header className="admin-header">
        <div className="header-content">
          <h1 className="header-title">LoyesTask Admin</h1>
          
          {/* Botón de menú (hamburguesa para móvil) */}
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
              <button
                className="menu-item"
                onClick={() => handleSectionChange('proyectos')}
              >
                Proyectos
              </button>
              <button
                className="menu-item"
                onClick={() => handleSectionChange('inventario')}
              >
                Inventario
              </button>
              <button
                className="menu-item"
                onClick={() => handleSectionChange('usuarios')}
              >
                Usuarios
              </button>
              <button
                className="menu-item"
                onClick={() => handleSectionChange('perfil')}
              >
                Perfil
              </button>
              <button
                className="menu-item"
                onClick={() => handleSectionChange('ia')}
              >
                IA
              </button>
              <div className="menu-divider"></div>
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
      <main className="admin-main">
        {/* Sección: Proyectos */}
        {currentSection === 'proyectos' && (
          <div className="section-proyectos">
            <div className="section-header">
              <h2 className="section-title">Proyectos</h2>
              <button 
                className="btn-nuevo-proyecto"
                onClick={handleOpenCreateModal}
              >
                NUEVO PROYECTO
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="loading-projects">
                <p>Cargando proyectos...</p>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="error-projects">
                <p>{error}</p>
              </div>
            )}

            {/* Lista de proyectos */}
            {!loading && !error && projects.length === 0 && (
              <div className="empty-state">
                <p>No hay proyectos disponibles.</p>
                <p className="empty-hint">Crea un nuevo proyecto para comenzar.</p>
              </div>
            )}

            {!loading && !error && projects.length > 0 && (
              <div className="proyectos-list">
                {projects.map((project) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    onEdit={() => handleOpenEditModal(project)}
                    onDelete={() => handleOpenDeleteModal(project)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sección: Usuarios */}
        {currentSection === 'usuarios' && (
          <div className="section-usuarios">
            <UserManagement />
          </div>
        )}

        {/* Sección: Perfil */}
        {currentSection === 'perfil' && (
          <div className="section-perfil">
            <ProfileView />
          </div>
        )}

        {/* Otras secciones (próximamente) */}
        {currentSection !== 'proyectos' && currentSection !== 'usuarios' && currentSection !== 'perfil' && (
          <div className="section-placeholder">
            <h2>🚧 {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}</h2>
            <p>Esta sección estará disponible próximamente.</p>
          </div>
        )}
      </main>

      {/* Modales */}
      {modalType === 'create' && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Nuevo Proyecto</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Cliente</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                />
              </div>
              {error && <div className="form-error">{error}</div>}
              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType === 'edit' && selectedProject && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Editar Proyecto</h2>
            <form onSubmit={handleUpdateProject}>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Cliente</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                />
              </div>
              {error && <div className="form-error">{error}</div>}
              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  Editar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType === 'delete' && selectedProject && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Eliminar Proyecto</h2>
            <form onSubmit={handleDeleteProject}>
              <p className="delete-warning">
                ¿Estás seguro de que deseas eliminar el proyecto "{selectedProject.name}"?
              </p>
              <div className="form-group">
                <label>Contraseña</label>
                <p className="input-hint">Coloca tu clave de administrador para borrar el proyecto</p>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="form-error">{error}</div>}
              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-delete">
                  Eliminar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Componente: Card de Proyecto
 */
interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="project-card">
      <div className="project-card-header">
        <h3 
          className="project-title"
          onClick={() => navigate(`/projects/${project._id}`)}
        >
          {project.name}
        </h3>
        
        <button
          className="project-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Opciones del proyecto"
        >
          ⋮
        </button>
        
        {menuOpen && (
          <div className="project-dropdown">
            <button 
              className="project-dropdown-item"
              onClick={() => {
                setMenuOpen(false);
                navigate(`/projects/${project._id}`);
              }}
            >
              Ver
            </button>
            <button 
              className="project-dropdown-item"
              onClick={() => {
                setMenuOpen(false);
                onEdit();
              }}
            >
              Edita Proyecto
            </button>
            <button 
              className="project-dropdown-item delete"
              onClick={() => {
                setMenuOpen(false);
                onDelete();
              }}
            >
              Eliminar Proyecto
            </button>
          </div>
        )}
      </div>
      
      <p className="project-description">{project.description}</p>
      
      <div className="project-footer">
        <span className="project-manager">{project.clientName}</span>
      </div>
    </div>
  );
};

export default AdminDashboard;
