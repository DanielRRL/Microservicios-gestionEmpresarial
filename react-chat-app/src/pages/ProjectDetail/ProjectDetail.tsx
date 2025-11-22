/**
 * ProjectDetail Component
 * 
 * Vista detallada de un proyecto con tablero Kanban de tareas.
 * Permite:
 * - Ver todas las tareas organizadas por estado
 * - Crear nuevas tareas
 * - Editar tareas existentes
 * - Cambiar estado de tareas (drag & drop o modal)
 * - Eliminar tareas (solo admin, requiere contraseña)
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService, { Project } from '../../services/projectService';
import taskService, { Task, TaskStatus, CreateTaskData, UpdateTaskData } from '../../services/taskService';
import authService from '../../services/authService';
import TaskDetailModal from '../TaskDetailModal/TaskDetailModal';
import './ProjectDetail.css';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // Estado del proyecto
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de modales
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  // Formulario de tarea
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  // Contraseña para eliminar
  const [deletePassword, setDeletePassword] = useState('');

  // Verificar si es admin
  const isAdmin = authService.isAdmin();

  // Cargar proyecto y tareas
  useEffect(() => {
    if (!projectId) {
      navigate('/admin');
      return;
    }

    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar proyecto
      const projectData = await projectService.getProjectById(projectId!);
      setProject(projectData);

      // Cargar tareas del proyecto
      const tasksData = await taskService.getTasksByProject(projectId!);
      setTasks(tasksData);
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      setError(err.response?.data?.error || 'Error al cargar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de crear tarea
  const openCreateModal = () => {
    setFormData({ name: '', description: '' });
    setModalType('create');
  };

  // Abrir modal de editar tarea
  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      name: task.name,
      description: task.description,
    });
    setModalType('edit');
  };

  // Abrir modal de eliminar tarea
  const openDeleteModal = (task: Task) => {
    setSelectedTask(task);
    setDeletePassword('');
    setModalType('delete');
  };

  // Cerrar modal
  const closeModal = () => {
    setModalType(null);
    setSelectedTask(null);
    setFormData({ name: '', description: '' });
    setDeletePassword('');
    setError(null);
  };

  // Crear tarea
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const taskData: CreateTaskData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      await taskService.createTask(projectId!, taskData);
      await loadProjectData(); // Recargar tareas
      closeModal();
    } catch (err: any) {
      console.error('Error al crear tarea:', err);
      setError(err.response?.data?.error || 'Error al crear la tarea');
    }
  };

  // Actualizar tarea
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setError(null);

    try {
      const updateData: UpdateTaskData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      await taskService.updateTask(projectId!, selectedTask._id, updateData);
      await loadProjectData(); // Recargar tareas
      closeModal();
    } catch (err: any) {
      console.error('Error al actualizar tarea:', err);
      setError(err.response?.data?.error || 'Error al actualizar la tarea');
    }
  };

  // Eliminar tarea
  const handleDeleteTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setError(null);

    // Verificar contraseña
    if (deletePassword !== 'admin123') {
      setError('Contraseña incorrecta');
      return;
    }

    try {
      await taskService.deleteTask(projectId!, selectedTask._id);
      await loadProjectData(); // Recargar tareas
      closeModal();
    } catch (err: any) {
      console.error('Error al eliminar tarea:', err);
      setError(err.response?.data?.error || 'Error al eliminar la tarea');
    }
  };

  // Cambiar estado de tarea (mover entre columnas)
  const handleChangeStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await taskService.updateTaskStatus(projectId!, taskId, newStatus);
      await loadProjectData(); // Recargar tareas
    } catch (err: any) {
      console.error('Error al cambiar estado:', err);
      setError(err.response?.data?.error || 'Error al cambiar estado');
    }
  };

  // Agrupar tareas por estado
  const tasksByStatus = {
    pending: tasks.filter(t => t.status === 'pending'),
    onHold: tasks.filter(t => t.status === 'onHold'),
    inProgress: tasks.filter(t => t.status === 'inProgress'),
    underReview: tasks.filter(t => t.status === 'underReview'),
    completed: tasks.filter(t => t.status === 'completed'),
  };

  // Componente de tarjeta de tarea
  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <div className="task-card" onClick={() => {
      setSelectedTask(task);
      setShowTaskDetail(true);
    }}>
      <div className="task-card-header">
        <h4 className="task-card-title">{task.name}</h4>
        <div className="task-card-menu" onClick={(e) => e.stopPropagation()}>
          <button className="task-menu-btn">⋮</button>
          <div className="task-dropdown">
            <button onClick={() => openEditModal(task)}>Editar Tarea</button>
            {isAdmin && (
              <button onClick={() => openDeleteModal(task)} className="delete-option">
                Eliminar Tarea
              </button>
            )}
          </div>
        </div>
      </div>
      <p className="task-card-description">{task.description}</p>
      
      {/* Selector de estado */}
      <select
        className="task-status-select"
        value={task.status}
        onChange={(e) => {
          e.stopPropagation();
          handleChangeStatus(task._id, e.target.value as TaskStatus);
        }}
      >
        <option value="pending">Pendiente</option>
        <option value="onHold">Espera</option>
        <option value="inProgress">En Proceso</option>
        <option value="underReview">Revisión</option>
        <option value="completed">Completado</option>
      </select>
    </div>
  );

  if (loading) {
    return <div className="loading-state">Cargando proyecto...</div>;
  }

  if (!project) {
    return <div className="error-state">Proyecto no encontrado</div>;
  }

  return (
    <div className="project-detail">
      {/* Header */}
      <div className="project-detail-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/admin')}>
            ← Volver
          </button>
          <div className="project-info">
            <h1 className="project-title">{project.name}</h1>
            <p className="project-client">{project.clientName}</p>
            <p className="project-description">{project.description}</p>
          </div>
        </div>
        {isAdmin && (
          <div className="header-actions">
            <button className="btn-add-user" onClick={() => navigate(`/projects/${projectId}/members`)}>
              Agregar Usuario
            </button>
            <button className="btn-create-task" onClick={openCreateModal}>
              Crear Tarea
            </button>
          </div>
        )}
      </div>

      {/* Error global */}
      {error && !modalType && (
        <div className="error-message">{error}</div>
      )}

      {/* Tablero Kanban */}
      <div className="kanban-board">
        {/* Columna: Pendiente */}
        <div className="kanban-column">
          <div className="column-header pending-header">
            <h3>Pendiente</h3>
            <span className="task-count">{tasksByStatus.pending.length}</span>
          </div>
          <div className="column-content">
            {tasksByStatus.pending.map(task => (
              <TaskCard key={task._id} task={task} />
            ))}
            {tasksByStatus.pending.length === 0 && (
              <div className="empty-column">No hay tareas pendientes</div>
            )}
          </div>
        </div>

        {/* Columna: Espera */}
        <div className="kanban-column">
          <div className="column-header onhold-header">
            <h3>Espera</h3>
            <span className="task-count">{tasksByStatus.onHold.length}</span>
          </div>
          <div className="column-content">
            {tasksByStatus.onHold.map(task => (
              <TaskCard key={task._id} task={task} />
            ))}
            {tasksByStatus.onHold.length === 0 && (
              <div className="empty-column">No hay tareas en espera</div>
            )}
          </div>
        </div>

        {/* Columna: En Proceso */}
        <div className="kanban-column">
          <div className="column-header inprogress-header">
            <h3>En Proceso</h3>
            <span className="task-count">{tasksByStatus.inProgress.length}</span>
          </div>
          <div className="column-content">
            {tasksByStatus.inProgress.map(task => (
              <TaskCard key={task._id} task={task} />
            ))}
            {tasksByStatus.inProgress.length === 0 && (
              <div className="empty-column">No hay tareas en proceso</div>
            )}
          </div>
        </div>

        {/* Columna: Revisión */}
        <div className="kanban-column">
          <div className="column-header review-header">
            <h3>Revisión</h3>
            <span className="task-count">{tasksByStatus.underReview.length}</span>
          </div>
          <div className="column-content">
            {tasksByStatus.underReview.map(task => (
              <TaskCard key={task._id} task={task} />
            ))}
            {tasksByStatus.underReview.length === 0 && (
              <div className="empty-column">No hay tareas en revisión</div>
            )}
          </div>
        </div>

        {/* Columna: Completado */}
        <div className="kanban-column">
          <div className="column-header completed-header">
            <h3>Completado</h3>
            <span className="task-count">{tasksByStatus.completed.length}</span>
          </div>
          <div className="column-content">
            {tasksByStatus.completed.map(task => (
              <TaskCard key={task._id} task={task} />
            ))}
            {tasksByStatus.completed.length === 0 && (
              <div className="empty-column">No hay tareas completadas</div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Crear Tarea */}
      {modalType === 'create' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Nueva Tarea</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Titulo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Nombre de la tarea"
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Descripción de la tarea"
                  rows={4}
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>
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

      {/* Modal: Editar Tarea */}
      {modalType === 'edit' && selectedTask && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Editar Tarea</h2>
            <form onSubmit={handleUpdateTask}>
              <div className="form-group">
                <label>Titulo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>
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

      {/* Modal: Eliminar Tarea */}
      {modalType === 'delete' && selectedTask && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Eliminar Tarea</h2>
            <p>
              ¿Estás seguro de que deseas eliminar la tarea <strong>{selectedTask.name}</strong>?
            </p>
            <form onSubmit={handleDeleteTask}>
              <div className="form-group">
                <label>Contraseña de Administrador</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                  placeholder="Ingresa tu contraseña"
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>
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

      {/* Modal: Detalle de Tarea */}
      {showTaskDetail && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setShowTaskDetail(false)}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
