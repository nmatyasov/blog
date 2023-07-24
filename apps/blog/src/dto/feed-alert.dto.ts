//import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class FeedAlertDto {
  // @ApiProperty({ description: 'New post comment', nullable: false })
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsNotEmpty()
  text: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  author: string;

  @IsNotEmpty()
  user: string;

  @IsNotEmpty()
  slug: string;
}
