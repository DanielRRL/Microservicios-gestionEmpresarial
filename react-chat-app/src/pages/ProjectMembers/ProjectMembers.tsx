/**
 * ProjectMembers Component
 * 
 * Vista para gestionar los miembros de un proyecto.
 * Permite:
 * - Ver lista de miembros actuales
 * - Agregar nuevos miembros
 * - Remover miembros existentes
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService, { Project } from '../../services/projectService';
import projectMembersService, { ProjectMember, User } from '../../services/projectMembersService';
import './ProjectMembers.css';

const ProjectMembers: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // Estado del proyecto y miembros
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado del modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!projectId) {
      navigate('/admin');
      return;
    }

    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar proyecto
      const projectData = await projectService.getProjectById(projectId!);
      setProject(projectData);

      // Cargar miembros
      const membersData = await projectMembersService.getProjectMembers(projectId!);
      setMembers(membersData);

      // Cargar usuarios disponibles
      const usersData = await projectMembersService.getAllUsers();
      setAvailableUsers(usersData);
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      setError(err.response?.data?.error || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setError(null);
      await projectMembersService.addMember(projectId!, selectedUser);
      await loadData(); // Recargar datos
      setShowAddModal(false);
      setSelectedUser('');
      setSearchTerm('');
    } catch (err: any) {
      console.error('Error al agregar miembro:', err);
      setError(err.response?.data?.error || 'Error al agregar el miembro');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas remover este miembro del proyecto?')) {
      return;
    }

    try {
      setError(null);
      await projectMembersService.removeMember(projectId!, userId);
      await loadData(); // Recargar datos
    } catch (err: any) {
      console.error('Error al remover miembro:', err);
      setError(err.response?.data?.error || 'Error al remover el miembro');
    }
  };

  // Filtrar usuarios que no son miembros
  const nonMembers = availableUsers.filter(
    (user) => !members.some((member) => member.userId === user.id)
  );

  // Filtrar por búsqueda
  const filteredNonMembers = nonMembers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading-state">Cargando miembros...</div>;
  }

  if (!project) {
    return <div className="error-state">Proyecto no encontrado</div>;
  }

  return (
    <div className="project-members">
      {/* Header */}
      <div className="members-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate(`/projects/${projectId}`)}>
            ← Volver al Proyecto
          </button>
          <div className="project-info">
            <h1 className="page-title">Miembros del Proyecto</h1>
            <p className="project-name">{project.name}</p>
          </div>
        </div>
        <button className="btn-add-member" onClick={() => setShowAddModal(true)}>
          + Agregar Miembro
        </button>
      </div>

      {/* Error global */}
      {error && !showAddModal && (
        <div className="error-message">{error}</div>
      )}

      {/* Tabla de miembros */}
      <div className="members-table-container">
        <table className="members-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Agregado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.userId}>
                <td>{member.name || 'Sin nombre'}</td>
                <td>{member.email || 'Sin email'}</td>
                <td>
                  <span className={`role-badge ${member.role}`}>
                    {member.role === 'owner' ? 'Propietario' : 'Miembro'}
                  </span>
                </td>
                <td>{new Date(member.addedAt).toLocaleDateString()}</td>
                <td>
                  {member.role !== 'owner' ? (
                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveMember(member.userId)}
                    >
                      Remover
                    </button>
                  ) : (
                    <span className="no-action">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {members.length === 0 && (
          <div className="empty-state">
            <p>No hay miembros en este proyecto.</p>
          </div>
        )}
      </div>

      {/* Modal: Agregar Miembro */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Agregar Miembro al Proyecto</h2>
            
            {/* Buscador */}
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Lista de usuarios */}
            <form onSubmit={handleAddMember}>
              <div className="users-list">
                {filteredNonMembers.length > 0 ? (
                  filteredNonMembers.map((user) => (
                    <label key={user.id} className="user-option">
                      <input
                        type="radio"
                        name="user"
                        value={user.id}
                        checked={selectedUser === user.id}
                        onChange={(e) => setSelectedUser(e.target.value)}
                      />
                      <div className="user-info">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="no-users">
                    {nonMembers.length === 0
                      ? 'Todos los usuarios ya son miembros del proyecto'
                      : 'No se encontraron usuarios'}
                  </p>
                )}
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedUser('');
                    setSearchTerm('');
                    setError(null);
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={!selectedUser}
                >
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMembers;
