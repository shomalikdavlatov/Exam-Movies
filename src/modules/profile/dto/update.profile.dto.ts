import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';

export class UpdateProfileDto {
  @Length(1, 50)
  @IsString()
  @IsOptional()
  username?: string;

  @Length(3, 100)
  @IsString()
  @IsOptional()
  full_name?: string;

  @IsPhoneNumber()
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  country?: string;
}
