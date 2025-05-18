import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { RoleGuard } from 'src/common/guards/role.guard';
import { CreateCategoryDto } from './dto/create.category.dto';
import { UpdateCategoryDto } from './dto/update.category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @Get()
  @SetMetadata('isFreeAuth', true)
  async getAll() {
    return await this.categoriesService.getAll();
  }
  @Get(':id')
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['superadmin', 'admin'])
  async getOne(@Param('id') id: string) {
    return await this.categoriesService.getOne(id);
  }
  @Post()
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['superadmin', 'admin'])
  async create(@Body() body: CreateCategoryDto) {
    return {
      message: 'Category has been created successfully!',
      data: await this.categoriesService.create(body),
    };
  }
  @Put(':id')
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['superadmin', 'admin'])
  async update(@Param('id') id: string, @Body() body: UpdateCategoryDto) {
    return {
      message: 'Category has been updated successfully!',
      data: await this.categoriesService.update(id, body),
    };
  }
  @Delete(':id')
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['superadmin', 'admin'])
  async delete(@Param('id') id: string) {
    await this.categoriesService.delete(id);
    return { message: 'Category has been deleted successfully!' };
  }
}
