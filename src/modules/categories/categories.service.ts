import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import slugify from 'slugify';
import SUI from 'short-unique-id';
import { CreateCategoryDto } from './dto/create.category.dto';
import { UpdateCategoryDto } from './dto/update.category.dto';

@Injectable()
export class CategoriesService {
  private uid = new SUI();
  constructor(private prisma: PrismaService) {}
  async getAll() {
    return await this.prisma.category.findMany();
  }
  async getOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category)
      throw new NotFoundException('Category with the specified id not found!');
    return category;
  }
  async create(body: CreateCategoryDto) {
    return await this.prisma.category.create({
      data: {
        ...body,
        slug:
          slugify(body.name, { strict: true, lower: true }) +
          '-' +
          this.uid.rnd(8),
      },
    });
  }
  async update(id: string, body: UpdateCategoryDto) {
    let category = await this.prisma.category.findUnique({ where: { id } });
    if (!category)
      throw new NotFoundException('Category with the specified id not found!');
    category = await this.prisma.category.update({ where: { id }, data: body });
    if (body.name)
      category = await this.prisma.category.update({
        where: { id },
        data: {
          slug:
            slugify(body.name, { strict: true, lower: true }) +
            '-' +
            this.uid.rnd(8),
        },
      });
    return category;
  }
  async delete(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category)
      throw new NotFoundException('Category with the specified id not found!');
    await this.prisma.category.delete({ where: { id } });
  }
}
