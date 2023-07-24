import { IsNotEmpty, IsString, NotContains } from 'class-validator';

export class PostSlugDto {
  @IsNotEmpty()
  @IsString()
  @NotContains(' ', { message: 'Slug should NOT contain any whitespace.' })
  slug: string;
}
