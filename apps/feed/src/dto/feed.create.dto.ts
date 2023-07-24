//import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';
import { Types } from 'mongoose';

export class FeedCreateDto {
  // @ApiProperty({ description: 'PostId', nullable: false })
  @IsNotEmpty()
  @MinLength(3, {
    message: 'Feedback is too short',
  })
  post: Types.ObjectId;

  // @ApiProperty({ description: 'AuthoId', nullable: false })
  @IsNotEmpty()
  author: Types.ObjectId;

  // @ApiProperty({ description: 'New comment', nullable: false })
  @IsNotEmpty()
  text: string;

  @IsNotEmpty()
  dateCreated: Date;
}
