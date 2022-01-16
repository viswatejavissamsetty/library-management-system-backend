import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateUserDto as UserDto } from 'src/types/create-user';

// This should be a real class/interface representing a user entity
export type User = {
  _id: string;
  idCardNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  nickName: string;
  email: string;
  password: string;
  mobileNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  village: string;
  pincode: string;
  country: string;
  branch: string;
  joiningDate: string;
  dateOfBirth: string;
  isLibrarian: string;
};

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
  ) {}

  async findOne(id: string): Promise<User | undefined> {
    const data = await this.userModel.findOne({ _id: id }).exec();
    // const data = await this.userModel.findById(id).exec();
    console.log(data);
    const user = await data.toJSON();
    return user;
  }

  async create(newUser: User): Promise<UserDto> {
    const user = await this.userModel.findById(newUser._id);
    if (!user) {
      try {
        const createdUser = new this.userModel(newUser);
        const data = await createdUser.save();
        return data;
      } catch (error) {
        throw new HttpException('Invalid Data', HttpStatus.FORBIDDEN);
      }
    } else {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }
  }

  async findAllUsers(): Promise<UserDto[]> {
    return this.userModel.find({}, { _id: false, __v: false }).exec();
  }
}
