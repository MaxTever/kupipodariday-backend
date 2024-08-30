import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Length, Min } from "class-validator";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Offer } from "../../offers/entities/offer.entity";
// Подключить в модуль и создать связи

@Entity()
export class Wish {

@PrimaryGeneratedColumn()
id: number;

@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;

@Column()
@IsNotEmpty()
@IsString()
@Length(1, 250)
name: string;

@Column()
@IsUrl()
@IsString()
link: string;

@Column()
@IsUrl()
@IsString()
image: string;

@Column('decimal', { precision: 10, scale: 2 })
@IsNotEmpty()
@IsNumber()
@Min(0)
price: number;

@Column('decimal', { precision: 10, scale: 2 })
@IsNumber()
raised: number;

/// owner: user Добавить связь

@ManyToOne(() => User, (user)=> user.wishes)
owner: User;

@Column()
@IsString()
@IsNotEmpty()
@Length(1, 1024)
description: string;

// offers: Offer[] Добавить связь

@OneToMany(() => Offer, (offer) => offer.item)
offers: Offer[];

@Column({ default: 0 })
@IsNotEmpty()
@IsNumber()
@Min(0)
copied: number;

}
