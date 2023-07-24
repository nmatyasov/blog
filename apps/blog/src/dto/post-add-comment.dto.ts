//import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PostFeedAddDto {
  // @ApiProperty({ description: 'New post comment', nullable: false })
  @IsNotEmpty()
  text: string;
}
