import { Document } from 'mongoose';

export interface CreateBookOrderDto extends Document {
  readonly _id: string;
  readonly userId: string;
  readonly bookId: string;
  readonly planedDate: Date;
  readonly takenDate: Date | string;
  readonly returnedDate: Date | string;
  readonly status: string;
  readonly fine: number;
  readonly issuer: string;
}
