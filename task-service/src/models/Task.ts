import { Schema, model } from 'mongoose';

const taskSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'onHold', 'inProgress', 'underReview', 'completed'],
      default: 'pending',
    },
    completedBy: [
      {
        userId: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          required: true,
        },
        _id: false,
      },
    ],
    assignedUsers: [
      {
        userId: {
          type: String,
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        _id: false,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Task = model('Task', taskSchema);
