import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}
  async create(id: string, body: object) {
    if (!body || !body['movie_id'])
      throw new BadRequestException('Please provide enough information!');
    const movie = await this.prisma.movie.findFirst({
      where: { id: body['movie_id'] },
    });
    if (!movie)
      throw new NotFoundException('Movie with the specified id not found!');
    if (
      await this.prisma.favorite.findFirst({
        where: { user_id: id, movie_id: body['movie_id'] },
      })
    )
      throw new ConflictException(
        'Movie with the specified id is already on favorites list!',
      );
    const favorite = await this.prisma.favorite.create({
      data: { user_id: id, movie_id: body['movie_id'] },
    });
    return {
      message: 'Movie has been added to list of favorites!',
      data: {
        id: favorite.id,
        movie_id: movie.id,
        movie_title: movie.title,
        created_at: favorite.created_at,
      },
    };
  }
  async getCountByMovieId(id: string) {
    return {
      count: await this.prisma.favorite.count({ where: { movie_id: id } }),
    };
  }
  async findAllByUserId(id: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { user_id: id },
    });
    const movieIds = favorites.map((favorite) => favorite.movie_id);
    const movies = await this.prisma.movie.findMany({
      where: { id: { in: movieIds } },
      select: {
        id: true,
        title: true,
        slug: true,
        poster_url: true,
        release_year: true,
        rating: true,
        subscription_type: true,
      },
    });
    return { data: { movies, total: movies.length } };
  }
  async delete(userId: string, movieId: string) {
    if (!(await this.prisma.movie.findFirst({ where: { id: movieId } })))
      throw new NotFoundException('Movie with the specified id not found!');
    const favorite = await this.prisma.favorite.findFirst({
      where: { user_id: userId, movie_id: movieId },
    });
    if (!favorite)
      throw new NotFoundException(
        'Favorite with the specified movie_id not found!',
      );
    await this.prisma.favorite.delete({ where: { id: favorite.id } });
    return { message: 'Favorite has been deleted successfully!' };
  }
}
