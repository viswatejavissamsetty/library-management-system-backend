import * as mongoose from 'mongoose';

export const BookSchema = new mongoose.Schema({
  // _id: { type: String, required: true },
  // bookId: { type: String, required: true },
  bookTitle: { type: String, required: true },
  bookDescription: { type: String, required: true },
  authorName: { type: String, required: true },
  authorDescription: { type: String, required: true },
  imagePath: { type: String, required: true },
  price: { type: String, required: true },
  fine: { type: String, required: true },
  totalNumberOfBooks: { type: String, required: true },
  availableNumberOfBooks: { type: String, required: true },
  ratings: { type: String, required: true },
  category: { type: String, required: true },
});
