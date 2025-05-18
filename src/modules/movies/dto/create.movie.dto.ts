import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @Length(1, 100)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Min(1888) // The first movie in the world
  @IsNumber()
  @Type(() => Number)
  release_year: number;

  @Min(0)
  @IsNumber()
  @Type(() => Number)
  duration_minutes: number;

  @IsEnum({ free: 'free', premium: 'premium' })
  @IsOptional()
  subscription_type?: 'free' | 'premium';

  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  category_ids: string[];
}
