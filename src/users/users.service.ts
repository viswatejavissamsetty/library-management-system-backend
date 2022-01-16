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

  private readonly users: User[] = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
    {
      userId: 3,
      username: 'viswa',
      password: 'Test@123',
    },
  ];

  // async findOne(username: string): Promise<User | undefined> {
  //   return this.users.find((user) => user.username === username);
  // }
  async findOne(username: string): Promise<UserDto | undefined> {
    return this.userModel.findOne({ username }).exec();
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

  async findAll(): Promise<UserDto[]> {
    return this.userModel.find().exec();
  }
}
