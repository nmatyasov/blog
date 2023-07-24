import { IsEmail, IsNotEmpty } from 'class-validator';

export class MailSimpleTemplate {
  @IsNotEmpty()
  @IsEmail()
  to: string;

  @IsEmail()
  from: string;

  @IsNotEmpty()
  template: string;

  @IsNotEmpty()
  subject: string;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  boxTitle: string;

  @IsNotEmpty()
  appTitle: string;

  @IsNotEmpty()
  url: string;

  @IsNotEmpty()
  buttonText: string;

  @IsNotEmpty()
  signature: string;

  @IsNotEmpty()
  publicUrl: string;
}
