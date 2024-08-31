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
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';
import { RequestUser } from 'src/utils/types';

@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(
    @Body() createWishlistDto: CreateWishlistDto,
    @Req() req: RequestUser,
  ) {
    return this.wishlistsService.create(req.user, createWishlistDto);
  }

  @Get()
  getWishlists() {
    return this.wishlistsService.getWishlists();
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  getWishlistById(@Param('id') id: string) {
    return this.wishlistsService.getWishlistById(+id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  updateWishlist(
    @Param('id') id: number,
    @Body() updateWishlistDto: UpdateWishlistDto,
    @Req() req,
  ) {
    return this.wishlistsService.updateWishlist(
      id,
      updateWishlistDto,
      req.user.id,
    );
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  deleteWishlist(@Param('id') id: number, @Req() req) {
    return this.wishlistsService.deleteWishlist(id, req.user.id);
  }
}
