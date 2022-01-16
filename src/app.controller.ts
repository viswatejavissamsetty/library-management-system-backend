import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('get-uesr-data')
  getData(@Body() auth: { secret: string }) {
    if (auth.secret == 'admin') {
      return this.userService.findAllUsers();
    } else {
      throw new NotFoundException('Cound not find creads.');
    }
  }
}
