import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { WishesService } from '../wishes/wishes.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishListRepository: Repository<Wishlist>,
    private wishesService: WishesService,
  ) {}

  async create(owner: User, createWishlistDto: CreateWishlistDto) {
    const wishes = await this.wishesService.findMany({});
    const items = createWishlistDto.itemsId.map((item) => {
      return wishes.find((wish) => wish.id === item);
    });

    delete owner.password;
    delete owner.email;

    const wishlist = this.wishListRepository.create({
      ...CreateWishlistDto,
      owner: owner,
      items: items,
    });

    return this.wishListRepository.save(wishlist);
  }

  async getWishlists() {
    const wishlists = await this.findMany({
      relations: {
        owner: true,
        items: true,
      },
    });

    wishlists.forEach((wishlist) => {
      delete wishlist.owner.email;
      delete wishlist.owner.password;
    });

    return wishlists;
  }

  async getWishlistById(id: number) {
    const wishlist = await this.wishListRepository.findOne({
      where: { id },
      relations: ['items', 'owner'],
    });

    if (!wishlist) {
      throw new BadRequestException('Коллекция не найдена');
    }

    wishlist.items.forEach((item) => {
      if (!item.offers) {
        item.raised = 0;
      } else {
        const amounts = item.offers.map((offer) => Number(offer.amount));
        item.raised = amounts.reduce((acc, value) => {
          return acc + value;
        }, 0);
      }
    });

    delete wishlist.owner.email;
    delete wishlist.owner.password;

    return wishlist;
  }

  async findOne(query: FindOneOptions<Wishlist>) {
    return this.wishListRepository.findOne(query);
  }

  async findMany(query: FindManyOptions<Wishlist>) {
    return this.wishListRepository.find(query);
  }

  async updateWishlist(
    idWishlist: number,
    updateWishlistDto: UpdateWishlistDto,
    idUser: number,
  ) {
    const wishlist = await this.findOne({
      where: { id: idWishlist },
      relations: {
        owner: true,
        items: true,
      },
    });

    if (!wishlist) {
      throw new BadRequestException('Коллекция не найдена');
    }

    if (wishlist.owner.id !== idUser) {
      throw new ForbiddenException('Недостаточно прав для редактирования');
    }

    await this.wishListRepository.update(idWishlist, updateWishlistDto);
    const updatedWishlist = await this.findOne({
      where: { id: idWishlist },
      relations: {
        owner: true,
        items: true,
      },
    });
    delete updatedWishlist.owner.email;
    delete updatedWishlist.owner.password;
    return updatedWishlist;
  }

  async deleteWishlist(id: number, idUser: number) {
    const wishlist = await this.findOne({
      where: { id },
      relations: {
        owner: true,
        items: true,
      },
    });

    if (!wishlist) {
      throw new BadRequestException('Коллекция не найдена');
    }

    if (wishlist.owner.id !== idUser) {
      throw new ForbiddenException('Недостаточно прав для удаления');
    }

    await this.wishListRepository.delete(id);

    return wishlist;
  }
}
