import { Types } from 'mongoose';

export class PostFeedsFilterDto {
  postId?: Types.ObjectId;

  limit?: number;

  skip?: number;
}
