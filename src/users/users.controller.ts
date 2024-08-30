import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  NotFoundException,
  UseGuards,
  Header
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestUser } from '../utils/types';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';
import { FindUserDto } from './dto/find-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtGuard)
  @Get('me')
  getUser(@Req() req: RequestUser) {
    return this.usersService.findOne({ where: { id: req.user.id } });
  }

  @Patch('me')
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestUser,
  ) {
    return this.usersService.updateOne(req.user.id, updateUserDto);
  }

  @Get(':username')
  async getUserByUsername(@Param('username') username: string) {
    const user = await this.usersService.findUserByUsername(username);

    if (!user) {
      throw new NotFoundException();
    }
    delete user.password;
    delete user.email;
    return user;
  }

  @Post('find')
  @Header('Content-Type', 'application/json')
  async findUserByEmailOrUserName(@Body() findUserDto: FindUserDto) {
    return this.usersService.findByUsernameOrEmail(findUserDto);
  }
}
