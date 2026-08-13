import { randomUUID } from 'crypto';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const UPLOADS_DIR = 'uploads';

export const ImageUploadInterceptor = FileInterceptor('file', {
  storage: diskStorage({
    destination: UPLOADS_DIR,
    filename: (_req, file, callback) => {
      callback(null, `${randomUUID()}${extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      callback(
        new BadRequestException({
          code: 'VALIDATION_001',
          message: 'Only JPEG, PNG or WEBP images are allowed',
        }),
        false,
      );
      return;
    }
    callback(null, true);
  },
});
