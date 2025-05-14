import { IsString, IsStrongPassword, Length } from 'class-validator';

export class LoginDto {
  @Length(1, 50)
  @IsString()
  username: string;

  @IsStrongPassword()
  @IsString()
  password: string;
}
