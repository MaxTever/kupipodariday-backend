import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class WishesService {

  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) { }

  async create(owner: User, createWishDto: CreateWishDto): Promise<Wish>{
    delete owner.email;
    delete owner.password;
    const wish = await this.wishesRepository.create({...CreateWishDto, owner: owner})
    return await this.wishesRepository.save(wish);
  }


  async find(query: FindOneOptions<Wish>) {
    return this.wishesRepository.find(query);
  }


  async findTop(){
    const wishes = await this.wishesRepository.find({
      take: 10,
      order: { createdAt: 'DESC'},
      relations: {
        owner: true,
        offers: {
          item: true,
        },
      },
    });
    const wishesCopied = wishes.filter(wish => {
      if (wish.copied === 0){
        return;
      } else {
        return wish;
      }
    });
    wishesCopied.forEach((wish) => {
      const amounts = wish.offers.map((offer) => Number(offer.amount));
    
      wish.raised = amounts.reduce( (acc, value) => {
        return acc + value;
      }, 0);

      delete wish.owner.email;
      delete wish.owner.password;
    });

    return wishesCopied;
  }



  async findLast() {
    const wishes = await this.wishesRepository.find({
      take: 40,
      order: { createdAt: 'DESC'},
      relations: {
        owner: true,
        offers: {
          item: true,
        },
      },
    });

    wishes.forEach((wish) => {
      const amounts = wish.offers.map((offer) => Number(offer.amount));
      wish.raised = amounts.reduce( (acc, value) => {
        return acc + value;
      }, 0);
      delete wish.owner.email;
      delete wish.owner.password;
    })
    return wishes;
  }


  

  async findWishById(id: number) {
    const wish = await this.wishesRepository.findOne({
      where: { id: +id },
      relations: {
        owner: true,
        offers: {
          item: true,
          user: { offers: true, wishes: true, wishlists: true},
        },
      },
    });
    if (!wish) {
      throw new BadRequestException('Подарок не найден');
    }

    const amounts = wish.offers.map((offer) => Number(offer.amount));

    wish.raised = amounts.reduce( (acc, value) => {
      return acc + value;
    }, 0);

    delete wish.owner.email;
    delete wish.owner.password;
    return wish;
  }

  async updateWish(id: number, userId: number, updateWishDto: UpdateWishDto) {
    const wish = await this.wishesRepository.findOne({
     where: { id },
     relations: {
       owner: true,
       offers: true,
     },
   });
   if (!wish) {
     throw new BadRequestException('Подарок не найден');
   }

   if (wish.owner.id !== userId){
    throw new BadRequestException('Недостаточно прав');
   }
 
   if (wish.offers.length !== 0 && wish.raised > 0){
    throw new ForbiddenException('Нельзя изменить цену, когда есть желающие скинуться');
   }

   await this.wishesRepository.update(id, updateWishDto);

   return this.wishesRepository.findOne({ where: { id }});
  }




  async copyWish(wishId: number, userId: number) {
    const wish = await this.wishesRepository.findOne({
      where: { id: wishId },
      relations: {
        owner: true
      },
    });
    if (!wish) {
      throw new NotFoundException();
    }
    if (wish.owner.id!== userId){
      throw new ForbiddenException('Подарок уже в коллекции');
    }

    const newWish = await this.wishesRepository.insert({
      ...wish,
      copied: 0,
      raised: 0,
      owner: {
        id: userId,
      },
  });
  wish.copied = +1;
  await this.wishesRepository.save(wish);
  return newWish;
  }


  async removeWish(id: number, userId: number) {
    const wish = await this.wishesRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        offers: true,
      },
    });
    if (!wish) {
      throw new BadRequestException('Подарок не найден');
    }

    if (wish.owner.id !== userId){
      throw new ForbiddenException('Недостаточно прав для удаления карточки');
    }

    await this.wishesRepository.delete(id);
    delete wish.owner.email;
    delete wish.owner.password;
    return wish;
  } 

}
