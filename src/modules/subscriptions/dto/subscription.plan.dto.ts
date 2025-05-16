import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class SubscriptionPlanDto {
  @Length(1, 50)
  @IsString()
  name: string;

  @Max(99999999)
  @Min(0)
  @IsNumber()
  price: number;

  @Min(0)
  @IsNumber()
  @IsOptional()
  duration_days?: number;

  @IsNotEmpty()
  features: any;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
