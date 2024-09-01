import {
  IsNotEmpty,
  IsString,
  Length,
  IsUrl,
  IsNumber,
  Min,
} from 'class-validator';
export class CreateWishDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 250)
  name: string;

  @IsNotEmpty()
  @IsUrl()
  link: string;

  @IsNotEmpty()
  @IsUrl()
  image: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsString()
  @Length(1, 1024)
  description: string;

  @IsNotEmpty()
  @IsNumber()
  raised: number;
}
