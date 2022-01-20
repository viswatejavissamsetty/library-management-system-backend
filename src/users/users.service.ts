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
  __v?: number;
};

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
  ) {}

  async findOne(id: string): Promise<User | undefined> {
    const data =
      (await this.userModel.findById(id).exec()) ||
      (await this.userModel.findOne({ email: id }));
    if (data) {
      const user = await data.toJSON();
      return user;
    } else {
      return null;
    }
  }

  async create(newUser: User): Promise<UserDto> {
    const user = await this.userModel.findById(newUser.idCardNumber);
    if (!user) {
      try {
        newUser._id = newUser.idCardNumber;
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

  async changePassword(
    userId: string,
    passowrdData: {
      oldPassword: string;
      newPassword: string;
      reEnteredPassword: string;
    },
  ) {
    const { newPassword, oldPassword, reEnteredPassword } = passowrdData;
    if (newPassword !== reEnteredPassword) {
      throw new HttpException('Invalid form data', HttpStatus.NOT_ACCEPTABLE);
    } else {
      const userData = await this.userModel.findById(userId);
      if (userData && userData.password === oldPassword) {
        return this.userModel.updateOne(
          { _id: userId },
          { password: newPassword },
        );
      } else {
        throw new HttpException('Invalid form data', HttpStatus.NOT_ACCEPTABLE);
      }
    }
  }

  async findAllUsers(): Promise<UserDto[]> {
    return this.userModel.find().exec();
  }
}
