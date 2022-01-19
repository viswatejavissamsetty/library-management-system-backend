import * as mongoose from 'mongoose';

export const BookSchema = new mongoose.Schema({
  // _id: { type: String, required: true },
  // bookId: { type: String, required: true },
  bookTitle: { type: String, required: true },
  bookDescription: { type: String, required: true },
  authorName: { type: String, required: true },
  authorDescription: { type: String, required: true },
  imagePath: { type: String, required: true },
  price: { type: Number, required: true },
  fine: { type: Number, required: true },
  totalNumberOfBooks: { type: Number, required: true },
  availableNumberOfBooks: { type: Number, required: true },
  ratings: { type: Number, required: true, default: null },
  category: { type: String, required: true },
});
