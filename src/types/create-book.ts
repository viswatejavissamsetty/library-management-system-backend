import { Document } from 'mongoose';

export interface CreateBookDto extends Document {
  readonly _id: string;
  // readonly bookId: string;
  readonly bookTitle: string;
  readonly bookDescription: string;
  readonly authorName: string;
  readonly authorDescription: string;
  readonly imagePath: string;
  readonly price: number;
  readonly fine: number;
  readonly totalNumberOfBooks: string;
  readonly availableNumberOfBooks: string;
  readonly ratings: number;
  readonly category: string;
}
