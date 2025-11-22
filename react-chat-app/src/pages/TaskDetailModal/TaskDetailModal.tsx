/**
 * TaskDetailModal Component
 * 
 * Modal para ver detalles de una tarea:
 * - Información de la tarea (nombre, descripción, estado)
 * - Usuarios asignados (solo miembros del proyecto)
 * - Notas de la tarea (crear, editar, eliminar)
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import noteService, { Note, CreateNoteData } from '../../services/noteService';
import userService from '../../services/userService';
import authService from '../../services/authService';
import './TaskDetailModal.css';

interface Task {
  _id: string;
  name: string;
  description: string;
  status: string;
  projectId: string;
}

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser?.id;

  // Estado de notas
  const [notes, setNotes] = useState<Note[]>([]);
  const [userNames, setUserNames] = useState<Map<string, string>>(new Map());
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');

  // Estado de carga y errores
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [task._id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar notas
      const notesData = await noteService.getNotes(projectId!, task._id);
      setNotes(notesData);

      // Obtener IDs únicos de creadores
      const creatorIds = [...new Set(notesData.map(note => note.createdBy))];
      
      // Cargar información de usuarios
      const usersInfo = await userService.getUsersInfo(creatorIds);
      const namesMap = new Map<string, string>();
      usersInfo.forEach((user, userId) => {
        namesMap.set(userId, user.name);
      });
      setUserNames(namesMap);

    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos de la tarea');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // GESTIÓN DE NOTAS
  // ========================================

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) return;

    try {
      setError(null);
      const noteData: CreateNoteData = { content: newNoteContent.trim() };
      await noteService.createNote(projectId!, task._id, noteData);
      setNewNoteContent('');
      await loadData(); // Recargar notas
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear nota');
    }
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note._id);
    setEditingNoteContent(note.content);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingNoteContent('');
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editingNoteContent.trim()) return;

    try {
      setError(null);
      const noteData: CreateNoteData = { content: editingNoteContent.trim() };
      await noteService.updateNote(projectId!, task._id, noteId, noteData);
      setEditingNoteId(null);
      setEditingNoteContent('');
      await loadData(); // Recargar notas
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar nota');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta nota?')) return;

    try {
      setError(null);
      await noteService.deleteNote(projectId!, task._id, noteId);
      await loadData(); // Recargar notas
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al eliminar nota');
    }
  };

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="task-modal-header">
          <div>
            <h2>{task.name}</h2>
            <p className="task-description">{task.description}</p>
            <span className={`task-status-badge ${task.status}`}>
              {task.status === 'pending' && 'Pendiente'}
              {task.status === 'onHold' && 'Espera'}
              {task.status === 'inProgress' && 'En Proceso'}
              {task.status === 'underReview' && 'Revisión'}
              {task.status === 'completed' && 'Completado'}
            </span>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-state">Cargando...</div>
        ) : (
          <div className="task-modal-body">
            {/* Sección de Notas */}
            <div className="task-section">
              <h3>Nota...</h3>
              <div className="notes-list">
                {notes.map((note) => (
                  <div key={note._id} className="note-item">
                    {editingNoteId === note._id ? (
                      <div className="note-edit">
                        <textarea
                          value={editingNoteContent}
                          onChange={(e) => setEditingNoteContent(e.target.value)}
                          rows={3}
                        />
                        <div className="note-actions">
                          <button onClick={() => handleSaveEdit(note._id)}>Guardar</button>
                          <button onClick={handleCancelEdit}>Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="note-display">
                        <div className="note-header">
                          <span className="note-author">
                            {userNames.get(note.createdBy) || 'Cargando...'}
                          </span>
                          <span className="note-date">
                            {new Date(note.createdAt).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="note-content">{note.content}</p>
                        {note.createdBy === currentUserId && (
                          <div className="note-actions">
                            <button onClick={() => handleStartEdit(note)}>Editar</button>
                            <button onClick={() => handleDeleteNote(note._id)}>Eliminar</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="note-create">
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Escribe una nota..."
                  rows={3}
                />
                <button className="btn-create-note" onClick={handleCreateNote}>
                  Crear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailModal;
