import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  SetMetadata,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { RoleGuard } from 'src/common/guards/role.guard';
import { MovieQueryDto } from './dto/movie.query.dto';
import { CreateMovieDto } from './dto/create.movie.dto';
import { MovieFileDto } from './dto/movie.file.dto';
import { UpdateMovieDto } from './dto/update.movie.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { Request } from 'express';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}
  @Get()
  @SetMetadata('isFreeAuth', true)
  async getAll(@Query() query: MovieQueryDto) {
    return await this.moviesService.getAll(query);
  }
  @Get(':slug')
  @SetMetadata('isFreeAuth', true)
  async getOne(@Param('slug') slug: string) {
    return await this.moviesService.getOne(slug);
  }
  @Post()
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['superadmin', 'admin'])
  @UseInterceptors(
    FileInterceptor('poster', {
      storage: diskStorage({
        destination: './uploads/posters',
        filename: (req, file, cb) => {
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowed.includes(file.mimetype)) {
          return callback(
            new UnsupportedMediaTypeException(
              'Only .jpg, .jpeg, .png image types are allowed!',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async createMovie(
    @Req() req: Request,
    @Body() body: CreateMovieDto,
    @UploadedFile() poster: Express.Multer.File,
  ) {
    if (!poster) throw new BadRequestException('Poster image is missing!');
    return await this.moviesService.createMovie(
      req['user'].userId,
      body,
      poster.path,
    );
  }
  @Post(':id/files')
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['superadmin', 'admin'])
  @SetMetadata('roles', ['superadmin', 'admin'])
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/movies',
        filename: (req, file, cb) => {
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowed = ['video/mp4', 'video/x-matroska', 'video/webm'];
        if (!allowed.includes(file.mimetype)) {
          return callback(
            new UnsupportedMediaTypeException(
              'Only .mp4, .mkv, .webm video types are allowed!',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async createMovieFile(
    @Param('id') id: string,
    @Body() body: MovieFileDto,
    @UploadedFile() video: Express.Multer.File,
  ) {
    return await this.moviesService.createMovieFile(id, body, video);
  }
  @Put(':id')
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['superadmin', 'admin'])
  @UseInterceptors(
    FileInterceptor('poster', {
      storage: diskStorage({
        destination: './uploads/posters',
        filename: (req, file, cb) => {
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowed.includes(file.mimetype)) {
          return callback(
            new UnsupportedMediaTypeException(
              'Only .jpg, .jpeg, .png image types are allowed!',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async updateMovie(
    @Param('id') id: string,
    @Body() body: UpdateMovieDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.moviesService.updateMovie(id, body, file);
  }
  @Delete(':id')
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['superadmin', 'admin'])
  async deleteMovie(@Param('id') id: string) {
    return await this.moviesService.deleteMovie(id);
  }
  @Delete('files/:id')
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['superadmin', 'admin'])
  async deleteMovieFile(@Param('id') id: string) {
    return await this.moviesService.deleteMovieFile(id);
  }
}
