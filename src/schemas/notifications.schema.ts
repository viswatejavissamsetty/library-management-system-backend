import * as mongoose from 'mongoose';

export const NotificationsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, required: true, default: 'UNREAD' }, // READ, UNREAD
  createdAt: { type: Date, required: true, default: new Date() },
  level: { type: String, required: true, default: 'NORMAL' },
});
