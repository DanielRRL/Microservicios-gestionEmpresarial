import { Types } from 'mongoose';

/**
 * Interfaz que representa un Proyecto completo en la base de datos
 * Incluye todos los campos del documento MongoDB
 */
export interface IProject {
  _id?: Types.ObjectId;      // ID único de MongoDB
  name: string;               // Nombre del proyecto
  description: string;        // Descripción del proyecto
  userId: string;             // ID del usuario dueño (desde Auth Service)
  clientName: string;         // Nombre del cliente
  isActive: boolean;          // Estado del proyecto (soft delete)
  createdAt?: Date;           // Fecha de creación (automático)
  updatedAt?: Date;           // Fecha de última actualización (automático)
}

/**
 * DTO (Data Transfer Object) para crear un proyecto
 * Solo incluye los campos que el usuario debe proporcionar
 * El userId se obtiene del token de autenticación
 */
export interface ICreateProjectDTO {
  name: string;
  description: string;
  clientName: string;
}

/**
 * DTO para actualizar un proyecto
 * Todos los campos son opcionales para permitir actualizaciones parciales
 */
export interface IUpdateProjectDTO {
  name?: string;
  description?: string;
  clientName?: string;
}
