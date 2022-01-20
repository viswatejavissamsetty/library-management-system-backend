import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // is a student roll number or Id number
  idCardNumber: { type: String, required: true },
  firstName: { type: String, required: true },
  middleName: { type: String, required: false },
  lastName: { type: String, required: true },
  nickName: { type: String, required: false },
  email: { type: String, required: true },
  password: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String, required: false },
  city: { type: String, required: true },
  state: { type: String, required: true },
  village: { type: String, required: false },
  pincode: { type: String, required: true },
  country: { type: String, required: true },
  branch: { type: String, required: true },
  joiningDate: { type: Date, required: true, default: new Date() },
  dateOfBirth: { type: Date, required: true },
  isLibrarian: { type: Boolean, required: true, default: false },
});
