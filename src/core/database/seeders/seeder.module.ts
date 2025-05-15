import { forwardRef, Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { DatabaseModule } from '../database.module';

@Module({
  imports: [],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
