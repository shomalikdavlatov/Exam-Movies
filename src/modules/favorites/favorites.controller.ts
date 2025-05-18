import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Req,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { Request } from 'express';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}
  @Post()
  async create(@Req() req: Request, @Body() body: object) {
    return await this.favoritesService.create(req['user'].userId, body);
  }
  @Get(':id')
  async getCountByMovieId(@Param('id') id: string) {
    return await this.favoritesService.getCountByMovieId(id);
  }
  @Get()
  async findAllByUserId(@Req() req: Request) {
    return await this.favoritesService.findAllByUserId(req['user'].userId);
  }
  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string) {
    return await this.favoritesService.delete(req['user'].userId, id);
  }
}
