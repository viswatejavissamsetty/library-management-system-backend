import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateUserDto as UserDto } from 'src/types/create-user';

// This should be a real class/interface representing a user entity
export type User = {
  userId: number;
  username: string;
  password: string;
};

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
  ) {}

  async findOne(username: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ username }).exec();
    return {
      userId: user._id,
      username: user.username,
      password: user.password,
    } as User;
  }

  async create(createUserDto: User): Promise<UserDto> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAllUsers(): Promise<UserDto[]> {
    return this.userModel.find({}, { _id: false, __v: false }).exec();
  }
}
