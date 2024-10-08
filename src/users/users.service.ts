import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, QueryFailedError, FindOneOptions } from 'typeorm';
import { HashService } from 'src/hash/hash.service';
import { FindUserDto } from './dto/find-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private hashServise: HashService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hash = await this.hashServise.hashPassword(createUserDto.password);
    try {
      const user = await this.userRepository.save({
        ...createUserDto,
        password: hash,
      });
      delete user.password;
      return user;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException(
            'Пользователь с таким email или username уже зарегистрирован',
          );
        }
      }
    }
  }

  findOne(query: FindOneOptions<User>): Promise<User> {
    return this.userRepository.findOne(query);
  }

  async findUserByUsername(username: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    return user;
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.email || updateUserDto.username) {
      const userExist = await this.userRepository.findOne({
        where: [
          { username: updateUserDto.username },
          { email: updateUserDto.email },
        ],
      });
      if (!!userExist) {
        throw new ConflictException(
          'Пользователь с таким email или username уже зарегистрирован',
        );
      }
    }
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashServise.hashPassword(
        updateUserDto.password,
      );
    }
    await this.userRepository.update({ id }, updateUserDto);

    const updatedUser = await this.findOne({
      where: { id: +id },
    });

    delete updatedUser.password;

    return updatedUser;
  }

  async findMany(query: string) {
    return this.userRepository.find({
      where: [{ email: query }, { username: query }],
    });
  }

  async findByUsernameOrEmail(findUserDto: FindUserDto) {
    const { query } = findUserDto;
    const user = await this.findMany(query);
    if (!user) {
      return;
    } else {
      delete user[0].password;
      return user;
    }
  }

  async findMyWishes(id: number) {
    const user = await this.findOne({
      where: { id: id },
      relations: {
        wishes: {
          owner: true,
          offers: {
            item: { owner: true, offers: true },
            user: { wishes: true, offers: true, wishlists: true },
          },
        },
      },
    });

    const userWishes = user.wishes.filter((wish) => {
      const amounts = wish.offers.map((offer) => Number(offer.amount));
      delete wish.owner.email;
      delete wish.owner.password;

      wish.raised = amounts.reduce((acc, value) => {
        return acc + value;
      }, 0);
      wish.price = Number(wish.price);
      return wish;
    });

    return userWishes;
  }
}
