import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(idCardNumber: string, password: string): Promise<any> {
    console.log(idCardNumber, password);
    const user = await this.usersService.findOne(idCardNumber);
    console.log(user);
    if (user && user.password === password) {
      const { password, _id, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    console.log(user);
    const payload = {
      name: [user.firstName, user.lastName].join(' '),
      sub: user.email,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
