import { Document } from 'mongoose';

export interface CreateUserDto extends Document {
  readonly userId: number;
  readonly username: string;
  readonly password: string;
}