import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestUser } from '../utils/types';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@Body() createWishDto: CreateWishDto, @Req() req: RequestUser) {
    return this.wishesService.create(req.user, createWishDto);
  }

  @UseGuards(JwtGuard)
  @Post(':id/copy')
  copyWish(@Param('id') id: number, @Req() req: RequestUser) {
    return this.wishesService.copyWish(id, req.user.id);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  getById(@Param('id') id: number) {
    return this.wishesService.findWishById(id);
  }

  @Get('/top')
  findTop() {
    return this.wishesService.findTop();
  }

  @Get('/last')
  findLast() {
    return this.wishesService.findLast();
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async updateWishlistLists(
    @Body() updateWishDto: UpdateWishDto,
    @Param('id') id: number,
    @Req() req: RequestUser,
  ) {
    return this.wishesService.updateWish(id, req.user.id, updateWishDto);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  removeWish(@Param('id') id: number, @Req() req: RequestUser) {
    return this.wishesService.removeWish(id, req.user.id);
  }
}
