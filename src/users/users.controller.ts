import { Body, Controller, Post } from '@nestjs/common';
import { User, UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('new-user')
  createUser(@Body() userData: User) {
    console.log(userData);

    this.usersService.create(userData);
  }
}
