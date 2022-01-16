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
    console.log(user);
    if (user && user.password === pass) {
      const { password, _id, ...rest } = user;
      return rest;
    }
    return null;
  }

  async login(user: User) {
    const payload = {
      username: user.firstName,
      sub: user.idCardNumber,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
