import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuthGuard } from './common/guards/auth.guard';
import { ProfileModule } from './modules/profile/profile.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { MoviesModule } from './modules/movies/movies.module';
import { CategoriesModule } from './modules/categories/categories.module';

@Module({
  imports: [CoreModule, AuthModule, UsersModule, ProfileModule, SubscriptionsModule, MoviesModule, CategoriesModule],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    AuthGuard,
  ],
})
export class AppModule {}
