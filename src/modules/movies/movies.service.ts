import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { MovieQueryDto } from './dto/movie.query.dto';
import slugify from 'slugify';
import SUI from 'short-unique-id';
import { CreateMovieDto } from './dto/create.movie.dto';
import { deleteFile } from 'src/common/utils/file.util';
import { MovieFileDto } from './dto/movie.file.dto';
import { UpdateMovieDto } from './dto/update.movie.dto';

@Injectable()
export class MoviesService {
  private uid = new SUI();
  constructor(private prisma: PrismaService) {}
  async getAll(query: MovieQueryDto) {
    const get = {
      select: {
        id: true,
        title: true,
        slug: true,
        poster_url: true,
        release_year: true,
        rating: true,
        subscription_type: true,
        movie_categories: {
          select: { category: { select: { name: true } } },
        },
      },
    };
    const where = {};
    if (query.search) where['name'] = query.search;
    if (query.subscription_type)
      where['subscription_type'] = query.subscription_type;
    if (query.min_rating !== undefined)
      where['rating'] = { gt: query.min_rating };
    if (query.max_rating !== undefined)
      where['rating']
        ? (where['rating']['lt'] = query.max_rating)
        : (where['rating'] = { lt: query.max_rating });
    if (query.min_year !== undefined)
      where['release_year'] = { gt: query.min_year };
    if (query.max_year !== undefined)
      where['release_year']
        ? (where['release_year']['lt'] = query.max_year)
        : (where['release_year'] = { lt: query.max_year });
    get['where'] = where;
    const count = await this.prisma.movie.findMany(get);
    if (query.limit) get['take'] = query.limit;
    if (query.page && query.limit)
      get['offset'] = (query.page - 1) * query.limit;
    const movies = await this.prisma.movie.findMany(get);
    let moviesWithCategories = movies.map(({ movie_categories, ...rest }) => ({
      ...rest,
      categories: movie_categories.map((mc) => mc.category.name),
    }));
    return {
      data: {
        movies: moviesWithCategories,
        pagination: {
          total: count.length,
          ...(query.page !== undefined &&
            query.limit !== undefined && { page: query.page }),
          ...(query.limit !== undefined && { limit: query.limit }),
          ...(query.page !== undefined &&
            query.limit !== undefined && {
              pages: Math.ceil(count.length / query.limit),
            }),
        },
      },
    };
  }
  // Not ready
  async getOne(slug: string) {
    const movie = await this.prisma.movie.findFirst({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        poster_url: true,
        release_year: true,
        rating: true,
        subscription_type: true,
        movie_categories: {
          select: { category: { select: { name: true } } },
        },
      },
    });
    if (!movie)
      throw new NotFoundException('Movie with the specified slug not found');
    const { movie_categories, ...rest } = movie;
    const files = await this.prisma.movieFile.findMany({
      where: { movie_id: movie.id },
    });
    const reviewsCount = await this.prisma.review.count({
      where: { movie_id: movie.id },
    });
    return {
      ...rest,
      categories: movie.movie_categories.map((mc) => mc.category.name),
      files,
      reviews: {
        average_rating: movie.rating,
        count: reviewsCount,
      },
    };
  }
  async createMovie(id: string, body: CreateMovieDto, poster_url: string) {
    // @ts-ignore
    const { category_ids, ...movieData } = body;
    if (movieData['subscription_type'] === undefined)
      delete movieData['subscription_type'];
    const movie = await this.prisma.movie.create({
      data: {
        ...movieData,
        slug:
          slugify(body['title'], { strict: true, lower: true }) +
          '-' +
          this.uid.rnd(8),
        poster_url,
        rating: 0,
        created_by: id,
      },
    });
    const notFoundCategories: string[] = [];
    for (const category_id of category_ids) {
      const category = await this.prisma.category.findFirst({
        where: { id: category_id },
      });
      if (!category) {
        notFoundCategories.push(category_id);
        continue;
      }
      await this.prisma.movieCategory.create({
        data: { movie_id: movie.id, category_id },
      });
    }
    return {
      data: {
        id: movie.id,
        title: movie.title,
        slug: movie.slug,
        created_at: movie.created_at,
        invalid_category_ids: notFoundCategories,
      },
    };
  }
  async createMovieFile(id: string, body: MovieFileDto, video: object) {
    const movie = await this.prisma.movie.findFirst({ where: { id } });
    if (!movie) {
      deleteFile(video['path']);
      throw new NotFoundException('Movie with the specified id not found!');
    }
    const movieFile = await this.prisma.movieFile.create({
      data: {
        movie_id: id,
        file_url: video['path'],
        quality: body.quality,
        language: body.language,
      },
    });
    return {
      data: {
        id: movieFile.id,
        movie_id: id,
        quality: movieFile.quality,
        language: movieFile.language,
        size_mb: Math.ceil(video['size'] / 1024 / 1024),
        file_url: movieFile.file_url,
      },
    };
  }
  async updateMovie(id: string, body: UpdateMovieDto, poster: object) {
    const checkMovie = await this.prisma.movie.findFirst({ where: { id } });
    if (!checkMovie) {
      deleteFile(poster['path']);
      throw new NotFoundException('Movie with the specified id not found!');
    }
    if (poster) {
      deleteFile(checkMovie.poster_url);
      body['poster_url'] = poster['path'];
    }
    if (body.title)
      body['slug'] =
        slugify(body.title, { strict: true, lower: true }) +
        '-' +
        this.uid.rnd(8);
    const { category_ids, ...movie } = body;
    const updatedMovie = await this.prisma.movie.update({
      where: { id },
      data: movie,
    });
    const notFoundCategories: string[] = [];
    if (category_ids && category_ids.length) {
      await this.prisma.movieCategory.deleteMany({ where: { movie_id: id } });
      for (const category_id of category_ids) {
        const category = await this.prisma.category.findFirst({
          where: { id: category_id },
        });
        if (!category) {
          notFoundCategories.push(category_id);
          continue;
        }
        await this.prisma.movieCategory.create({
          data: { movie_id: id, category_id },
        });
      }
    }
    return {
      data: {
        id,
        title: updatedMovie.title,
        updated_at: updatedMovie.updated_at,
        invalid_category_ids: notFoundCategories,
      },
    };
  }
  async deleteMovie(id: string) {
    const movie = await this.prisma.movie.findFirst({ where: { id } });
    if (!movie)
      throw new NotFoundException('Movie with the specified id not found!');
    const movieFiles = await this.prisma.movieFile.findMany({
      where: { movie_id: id },
    });
    for (const movieFile of movieFiles) {
      deleteFile(movieFile.file_url);
    }
    await this.prisma.movie.delete({ where: { id } });
    return { message: 'Movie has been deleted successfully!' };
  }
  async deleteMovieFile(id: string) {
    const movieFile = await this.prisma.movieFile.findFirst({ where: { id } });
    if (!movieFile)
      throw new NotFoundException('MovieFile with the specified id not found!');
    deleteFile(movieFile.file_url);
    await this.prisma.movieFile.delete({ where: { id } });
    return { message: 'MovieFile has been deleted successfully!' };
  }
}
