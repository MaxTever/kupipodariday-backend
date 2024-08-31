import { IsString, Length, IsOptional, IsUrl, IsArray } from 'class-validator';

export class UpdateWishlistDto {
  @IsString()
  @Length(1, 250)
  @IsOptional()
  name: string;

  @IsOptional()
  @Length(1, 1500)
  description: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  image: string;

  @IsArray()
  @IsOptional()
  itemsId: number[];
}
