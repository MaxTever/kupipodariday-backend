import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { HashService } from '../hash/hash.service';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private hashService: HashService,
  ) {}

  async authenticate(user: User) {
    const payload = { sub: user.id };
    return { access_token: this.jwtService.sign(payload, { expiresIn: '7d' }) };
  }

  async validateUserPassword(username: string, password: string) {
    const user = await this.usersService.findUserByUsername(username);

    if (!user) {
      return null;
    } else {
      const isValid = await this.hashService.comparePasswords(
        password,
        user.password,
      );
      return isValid ? user : null;
    }
  }
}
