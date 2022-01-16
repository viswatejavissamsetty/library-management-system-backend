import { Controller, Post, Body, NotFoundException } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('get-uesr-data')
  getData(@Body() auth: { secret: string }) {
    if (auth.secret == 'admin') {
      return this.userService.findAllUsers();
    } else {
      throw new NotFoundException('Cound not find creads.');
    }
  }
}
