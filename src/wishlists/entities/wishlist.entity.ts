import {
  IsNotEmpty,
  IsString,
  IsUrl,
  Length,
  IsOptional,
} from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Wish } from '../../wishes/entities/wish.entity';
// Подключить в модуль класса Wishlist

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 250 })
  @Length(1, 250)
  @IsString()
  name: string;

  @Column({ length: 1500 })
  @Length(1, 1500)
  @IsOptional()
  @IsString()
  description?: string;

  @Column()
  @IsString()
  @IsOptional()
  image?: string;

  // Добавить связь с пользователем owner: User
  @ManyToOne(() => User, (user) => user.wishlists)
  owner: User;

  // Добавить связь с items: Wish[];

  @ManyToMany(() => Wish)
  @JoinTable()
  items: Wish[];
}
