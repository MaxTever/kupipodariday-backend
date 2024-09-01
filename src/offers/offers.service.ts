import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { Repository } from 'typeorm';
import { WishesService } from 'src/wishes/wishes.service';
import { User } from 'src/users/entities/user.entity';
import { UpdateWishDto } from 'src/wishes/dto/update-wish.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    private wishesService: WishesService,
  ) {}

  async create(createOfferDto: CreateOfferDto, user: User) {
    const wish = await this.wishesService.findOne({
      where: { id: createOfferDto.itemId },
      relations: {
        offers: true,
        owner: true,
      },
    });

    if (!wish) {
      throw new NotFoundException();
    }

    if (wish.owner.id !== user.id) {
      throw new ForbiddenException();
    }

    const offerAmmount = wish.offers.map((offer) => Number(offer.amount));
    const sum = offerAmmount.reduce((acc, value) => {
      return acc + value;
    }, 0);

    wish.raised = sum;

    if (
      wish.raised > wish.price ||
      wish.raised + createOfferDto.amount > wish.price
    ) {
      throw new ForbiddenException('Превышена сумма');
    }

    const offer = this.offerRepository.create({
      ...createOfferDto,
      user: user,
      item: wish,
    });

    if (offer.hidden === false) {
      delete offer.user;
      await this.offerRepository.save(offer);
      const updateWishDto = new UpdateWishDto();
      updateWishDto.raised = wish.raised;
      await this.wishesService.updateWish(wish.id, user.id, updateWishDto);
    }

    delete offer.item.owner.email;
    delete offer.item.owner.password;
    delete offer.user.email;
    delete offer.user.password;

    await this.offerRepository.save(offer);
    const updateWishDto = new UpdateWishDto();
    updateWishDto.raised = wish.raised;
    await this.wishesService.updateWish(wish.id, user.id, updateWishDto);
    return offer;
  }

  async findOffers() {
    const offers = await this.offerRepository.find({
      relations: {
        item: { offers: true, owner: true },
        user: {
          offers: { item: true },
          wishes: { offers: true },
          wishlists: true,
        },
      },
    });

    offers.forEach((offer) => {
      offer.amount = Number(offer.amount);
      offer.item.price = Number(offer.item.price);
      delete offer.item.owner.email;
      delete offer.item.owner.password;
      offer.user?.wishes.forEach((wish) => {
        wish.price = Number(wish.price);
      });
    });

    return offers;
  }
}
