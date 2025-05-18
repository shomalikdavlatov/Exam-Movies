import { Module, UnsupportedMediaTypeException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        filename: (req, file, callback) => {
          callback(null, `${uuid()}${extname(file.originalname)}`);
        },
        destination: './uploads/avatars',
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
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
