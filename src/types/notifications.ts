import { Document } from 'mongoose';

export interface NotificationDto extends Document {
  readonly _id: string;
  readonly userId: string;
  readonly message: string;
  readonly status: string;
  readonly createdAt: Date;
}
