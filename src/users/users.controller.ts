import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User, UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    if (req.user) {
      const data = await this.usersService.findOne(req.user.idCardNumber);
      const { _id, password, __v, ...rest } = data;
      return rest;
    }
    return req.user;
  }

  @Post('new-user')
  createUser(@Body() userData: User) {
    this.usersService.create(userData);
  }

  @Post('get-users-data')
  getData(@Body() auth: { secret: string }) {
    if (auth.secret == 'admin') {
      return this.usersService.findAllUsers();
    } else {
      throw new NotFoundException('Cound not find creads.');
    }
  }
}
