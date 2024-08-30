import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LocalGuard } from './guards/local-auth.guard';
import { RequestUser } from 'src/utils/types';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @UseGuards(LocalGuard)
  @Post('signin')
  signin(@Req() req: RequestUser) {
    return this.authService.authenticate(req.user);
  }

  @Post('signup')
  async signup(@Body() createUsreDto: CreateUserDto) {
    const user = await this.usersService.create(createUsreDto);
    return this.authService.authenticate(user);
  }
}
