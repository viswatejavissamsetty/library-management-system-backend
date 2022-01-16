import { Document } from 'mongoose';

export interface CreateUserDto extends Document {
  readonly _id: string;
  readonly idCardNumber: string;
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string;
  readonly nickName: string;
  readonly email: string;
  readonly password: string;
  readonly mobileNumber: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly city: string;
  readonly state: string;
  readonly village: string;
  readonly pincode: string;
  readonly country: string;
  readonly branch: string;
  readonly joiningDate: string;
  readonly dateOfBirth: string;
  readonly isLibrarian: string;
}
