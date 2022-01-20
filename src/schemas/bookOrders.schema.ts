import * as mongoose from 'mongoose';

export const BookOrderSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // is a student roll number or Id number
  bookId: { type: String, required: true },
  planedDate: { type: Date, required: true, default: new Date() }, // auto generated
  takenDate: { type: Date, required: true }, // auto generated
  returnedDate: { type: Date, required: true }, // auto generated
  status: { type: String, required: true }, // PLANNED, TAKEN, CANCLED, RETURNED
  fine: { type: Number, required: true },
  issuer: { type: String, required: false, default: null }, // Issuer id card number
});
