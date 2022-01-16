import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(idCardNumber: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(idCardNumber);
    if (user && user.password === pass) {
      const { password, _id, ...rest } = user;
      return rest;
    }
    return null;
  }

  async login(user: User) {
    const payload = {
      name: [user.firstName, user.lastName].join(' '),
      dateOfBirth: user.dateOfBirth,
      email: user.email,
      mobileNumber: user.mobileNumber,
      idCardNumber: user.idCardNumber,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
