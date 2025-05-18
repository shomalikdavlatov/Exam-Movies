import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class MovieQueryDto {
  @IsNumber()
  @IsOptional()
  page: number;

  @IsNumber()
  @IsOptional()
  limit: number;

  @IsString()
  @IsOptional()
  category: string;

  @IsString()
  @IsOptional()
  search: string;

  @IsString()
  @IsOptional()
  subscription_type: 'free' | 'premium';

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  min_rating: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  max_rating: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  min_year: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  max_year: number;
}
