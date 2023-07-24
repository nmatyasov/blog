import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class FeedProfileRelDto {
  @IsNotEmpty()
  user: Types.ObjectId;

  @IsNotEmpty()
  feed: Types.ObjectId;
}
