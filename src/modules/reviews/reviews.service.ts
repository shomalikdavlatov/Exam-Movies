import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create.review.dto';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}
  async create(userId: string, movieId: string, body: CreateReviewDto) {
    if (!(await this.prisma.movie.findFirst({ where: { id: movieId } })))
      throw new NotFoundException('Movie with the specified id not found!');
    if (
      await this.prisma.review.findFirst({
        where: { user_id: userId, movie_id: movieId },
      })
    )
      throw new ConflictException(
        'You have already given a review to this movie!',
      );
    const user = await this.prisma.user.findFirst({ where: { id: userId } });
    const review = await this.prisma.review.create({
      data: {
        rating: body.rating,
        comment: body.comment,
        user_id: userId,
        movie_id: movieId,
      },
    });
    const avgRating = await this.prisma.review.aggregate({
      where: { movie_id: movieId },
      _avg: { rating: true },
    });
    if (!avgRating._avg.rating)
      throw new InternalServerErrorException(
        'Something happened wrong with review creation!',
      );
    await this.prisma.movie.update({
      where: { id: movieId },
      data: { rating: avgRating._avg.rating },
    });
    return {
      message: 'Review added successfully!',
      data: {
        id: review.id,
        user: { id: userId, username: user!.username },
        movie_id: movieId,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
      },
    };
  }
  async findAllReviewsByMovieId(id: string) {
    if (!(await this.prisma.movie.findFirst({ where: { id } })))
      throw new NotFoundException('Movie with the specified id not found!');
    return await this.prisma.review.findMany({ where: { movie_id: id } });
  }
  async delete(id: string) {
    if (!(await this.prisma.review.findFirst({ where: { id } })))
      throw new NotFoundException('Review with the specified id not found!');
    await this.prisma.review.delete({ where: { id } });
    return { message: 'Review has been deleted successfully' };
  }
}
