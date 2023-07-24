//import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class PostUpdateDto {
  // @ApiProperty({ description: 'Update post titlle', nullable: false })
  @IsOptional()
  title: string;

  //@ApiProperty({ description: 'Update post description', nullable: false })
  @IsOptional()
  description: string;

  //@ApiProperty({ description: 'Update post body', nullable: false })
  @IsOptional()
  body: string;

  //@ApiProperty({ description: 'Update post body', nullable: false })
  @IsOptional()
  draft: boolean;
}
