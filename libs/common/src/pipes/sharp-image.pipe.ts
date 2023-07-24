import { Injectable, PipeTransform } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { join } from 'path';
import * as sharp from 'sharp';

@Injectable()
export class SharpPipe
  implements PipeTransform<Express.Multer.File, Promise<string>>
{
  async transform(image: Express.Multer.File): Promise<string> {
    const configService = new ConfigService();
    const originalName = path.parse(image.originalname).name;
    const filename = originalName + '.webp';

    const uploadPath = join(
      process.env.PWD,
      configService.get<string>('STATIC_FOLDER'),
      'images'
    );

    await sharp(image.buffer)
      .resize(800)
      .webp({ effort: 3 })
      .toFile(path.join(uploadPath, filename));

    return filename;
  }
}
