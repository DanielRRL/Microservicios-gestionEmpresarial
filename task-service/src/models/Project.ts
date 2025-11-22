import { Schema, model } from 'mongoose';

const projectSchema = new Schema(
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
    userId: {
      type: String,
      required: true,
      index: true,
    },
    clientName: {
      type: String,
      required: false,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    members: [
      {
        userId: {
          type: String,
          required: true,
        },
        role: {
          type: String,
          enum: ['owner', 'member'],
          default: 'member',
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

export const Project = model('Project', projectSchema);
