import { Types } from 'mongoose';

/**
 * Tipo para los estados posibles de una tarea
 */
export type TaskStatus = 'pending' | 'onHold' | 'inProgress' | 'underReview' | 'completed';

/**
 * Interfaz para el historial de completado de tareas
 * Registra qué usuarios han marcado la tarea con qué estado
 */
export interface ICompletedBy {
  userId: string;    // ID del usuario desde Auth Service
  status: string;    // Estado que registró el usuario
}

/**
 * Interfaz que representa una Tarea completa en la base de datos
 * Incluye todos los campos del documento MongoDB
 */
export interface ITask {
  _id?: Types.ObjectId;           // ID único de MongoDB
  name: string;                    // Nombre de la tarea
  description: string;             // Descripción de la tarea
  projectId: Types.ObjectId;       // Referencia al proyecto padre
  status: TaskStatus;              // Estado actual de la tarea
  completedBy: ICompletedBy[];     // Historial de usuarios que completaron
  createdAt?: Date;                // Fecha de creación (automático)
  updatedAt?: Date;                // Fecha de última actualización (automático)
}

/**
 * DTO (Data Transfer Object) para crear una tarea
 * Solo incluye los campos que el usuario debe proporcionar
 */
export interface ICreateTaskDTO {
  name: string;
  description: string;
}

/**
 * DTO para actualizar una tarea
 * Todos los campos son opcionales para permitir actualizaciones parciales
 */
export interface IUpdateTaskDTO {
  name?: string;
  description?: string;
  status?: TaskStatus;
}

/**
 * DTO para actualizar solo el estado de una tarea
 */
export interface IUpdateTaskStatusDTO {
  status: TaskStatus;
}
