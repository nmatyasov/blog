import { Types } from 'mongoose';

export class PostFeedsFilterDto {
  postId?: Types.ObjectId;
  //@ApiProperty({ description: 'How many tasks to choose', nullable: true })
  limit?: number;
  /*@ApiProperty({
    description: 'How many tasks to skip in the selection',
    nullable: true,
  })*/
  skip?: number;
}
