import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

export class MovieFileDto {
  @IsEnum({
    p240: 'p240',
    p360: 'p360',
    p480: 'p480',
    p720: 'p720',
    p1080: 'p1080',
    k4: 'k4',
  })
  @IsNotEmpty()
  quality: 'p240' | 'p360' | 'p480' | 'p720' | 'p1080' | 'k4';

  @IsString()
  @Length(2, 20)
  language: string;
}
