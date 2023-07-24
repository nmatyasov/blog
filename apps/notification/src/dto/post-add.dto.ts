import { IsEmail, IsNotEmpty } from 'class-validator';

export class postAddConfirmaion {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  author: string;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  slug: string;
}
