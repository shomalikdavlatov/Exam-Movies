import {
  IsBoolean,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class PurchaseDto {
  @IsString()
  @IsNotEmpty()
  plan_id: string;

  @IsString()
  @IsNotEmpty()
  payment_method: 'card' | 'paypal' | 'bank_transfer' | 'crypto';

  @IsBoolean()
  @IsOptional()
  auto_renew?: boolean;

  @IsNotEmpty()
  payment_details: any;
}
