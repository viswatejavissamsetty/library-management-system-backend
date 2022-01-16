import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { User, UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('new-user')
<<<<<<< HEAD
  async createUser(@Body() userData: User) {
    userData._id = userData.idCardNumber;
    try {
      const user = await this.usersService.create(userData);
      const { password, _id, ...responseData } = user.toJSON();
      return responseData;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
=======
  createUser(@Body() userData: User) {
    console.log(userData);

    this.usersService.create(userData);
>>>>>>> parent of 944f77a (authentication done)
  }
}
