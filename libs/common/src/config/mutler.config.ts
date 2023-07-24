import { FileFilterCallback, diskStorage, memoryStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const configService = new ConfigService();
/**List image types */
const imageMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;
// Multer upload options
export const multerOptions = {
  // Enable file size limits
  limits: {
    fileSize: configService.get<number>('MAX_FILE_SIZE'),
  },
  // Check the mimetypes to allow for upload
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const mimeType = imageMimeTypes.find((im) => im === file.mimetype);
    if (mimeType) {
      // Allow storage of file
      cb(null, true);
    } else {
      // Reject file
      cb(null, false);
      //only when cb:any
      //cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
    }
  },
  // Storage in memory (Buffer) properties
  storageInMemory: memoryStorage(),

  // Local storage properties
  storage: diskStorage({
    // Destination storage path details
    destination: (
      req: Request,
      file: Express.Multer.File,
      cb: DestinationCallback
    ) => {
      const uploadPath = join(
        process.env.PWD,
        configService.get<string>('STATIC_FOLDER'),
        'images'
      );
      // Create folder if doesn't exist
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },
    // File modification details
    filename: (
      req: Request,
      file: Express.Multer.File,
      cb: FileNameCallback
    ) => {
      // Calling the callback passing the random name generated with the original extension name
      cb(null, `${uuid()}${extname(file.originalname)}`);
    },
  }),
};
