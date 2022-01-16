import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { User, UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('new-user')
  async createUser(@Body() userData: User) {
    userData._id = userData.idCardNumber;
    try {
      const user = await this.usersService.create(userData);
      const { password, _id, ...responseData } = user.toJSON();
      return responseData;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
