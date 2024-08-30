import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, Length } from "class-validator";
import { Wish } from "../../wishes/entities/wish.entity";
import { Wishlist } from "../../wishlists/entities/wishlist.entity";
import { Offer } from "../../offers/entities/offer.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

// Добавить связи и подключить в юзер модуль 

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({unique: true})
    @IsNotEmpty()
    @Length(2, 20)
    @IsString()
    username: string;

    @Column({default: 'Пока ничего не рассказал о себе'})
    @IsOptional()
    @Length(2, 200)
    @IsString()
    about: string;

    @Column({default: 'https://i.pravatar.cc/300'})
    @IsUrl()
    avatar: string;

    @Column({unique: true})
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @Column()
    @IsNotEmpty()
    @IsString()
    password: string;

    // Добавить связи!!!!!!
    @OneToMany(()=> Wish, wish => wish.owner)
    wishes: Wish[];

    @OneToMany(()=> Offer, offer => offer.user)
    offers: Offer[];

    @OneToMany(()=> Wishlist, (wishlist) => wishlist.owner)
    wishlists: Wishlist[];

}
