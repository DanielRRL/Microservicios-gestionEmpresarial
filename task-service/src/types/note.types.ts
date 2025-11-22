import { Types } from 'mongoose';

/**
 * Interfaz que representa una Nota completa en la base de datos
 * Una nota está asociada a una tarea específica
 */
export interface INote {
  _id?: Types.ObjectId;      // ID único de MongoDB
  content: string;            // Contenido de la nota
  createdBy: string;          // ID del usuario que creó la nota (desde Auth Service)
  taskId: Types.ObjectId;     // Referencia a la tarea padre
  createdAt?: Date;           // Fecha de creación (automático)
  updatedAt?: Date;           // Fecha de última actualización (automático)
}

/**
 * DTO (Data Transfer Object) para crear una nota
 * Solo incluye el campo que el usuario debe proporcionar
 * El createdBy se obtiene del token de autenticación
 * El taskId se obtiene de los parámetros de la URL
 */
export interface ICreateNoteDTO {
  content: string;
}
