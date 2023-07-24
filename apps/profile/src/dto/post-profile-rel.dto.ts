import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class PostProfileRelDto {
  @IsNotEmpty()
  user: Types.ObjectId;

  @IsNotEmpty()
  post: Types.ObjectId;
}
