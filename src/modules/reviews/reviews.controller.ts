import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create.review.dto';
import { Request } from 'express';

@Controller('movies')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
  @Post(':id/reviews')
  async create(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: CreateReviewDto,
  ) {
    return await this.reviewsService.create(req['user'].userId, id, body);
  }
  @Get(':id/reviews')
  async findAllReviewsByMovieId(@Param('id') id: string) {
    return await this.reviewsService.findAllReviewsByMovieId(id);
  }
  @Delete(':id/review')
  async delete(@Param('id') id: string) {
    return await this.reviewsService.delete(id);
  }
}
