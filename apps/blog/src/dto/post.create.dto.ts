//import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class PostCreateDto {
  // @ApiProperty({ description: 'New post titlle', nullable: false })
  @IsNotEmpty()
  @MaxLength(50, {
    message: 'Title is too long',
  })
  title: string;

  //@ApiProperty({ description: 'New post description', nullable: false })
  @IsNotEmpty()
  @MinLength(10, {
    message: 'Description is too short',
  })
  @MaxLength(50, {
    message: 'Description is too long',
  })
  description: string;

  //@ApiProperty({ description: 'New post body', nullable: false })
  @IsNotEmpty()
  @MinLength(10, {
    message: 'Body is too short',
  })
  body: string;

  //@ApiProperty({ description: 'New post body', nullable: false })
  draft: boolean;
}
