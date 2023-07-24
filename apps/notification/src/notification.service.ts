import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { MailSimpleTemplate } from './dto/mailer-simple.template.dto';
import { postAddConfirmaion } from './dto/post-add.dto';
import { ConfigService } from '@nestjs/config';
import { IsEmail } from 'class-validator';

@Injectable()
export class NotificationService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService
  ) {}
  async postCreated(data: any) {
    const { title, slug } = data;
    const email = data.user.email;
    const author = data.user.nickName;
    const url = `${this.configService.get(
      'BACKEND_URL'
    )}/${this.configService.get('GLOBAL_PREFFIX')}/blog/post/${slug}`;

    const mail = {
      to: email,
      from: `${this.configService.get(
        'MAIL_APP_NAME'
      )} <${this.configService.get('MAIL_FROM')}>`,
      subject: `${this.configService.get(
        'MAIL_APP_NAME'
      )}  - Опубликована новая статья в блоге ${author}`,
      template: './email.html',
      content: `Автор ${author} опубликовал новаю статью ${title} `,
      buttonText: 'Read more',
      boxTitle: 'Read more',
      appTitle: this.configService.get('MAIL_APP_NAME'),
      signature: `${this.configService.get('MAIL_APP_NAME')} Team`,
      url,
      publicUrl: this.configService.get('FRONTEND_URL'),
    } as MailSimpleTemplate;

    await this.sendMail(mail);
  }

  async postPublished(data: any) {
    console.log(data);

    const { title, slug } = data;
    const email = data.user.email;
    const author = data.user.nickName;
    const url = `${this.configService.get(
      'BACKEND_URL'
    )}/${this.configService.get('GLOBAL_PREFFIX')}/blog/post/${slug}`;

    const mail = {
      to: email,
      from: `${this.configService.get(
        'MAIL_APP_NAME'
      )} <${this.configService.get('MAIL_FROM')}>`,
      subject: `${this.configService.get(
        'MAIL_APP_NAME'
      )}  - New article published ${author}`,
      template: './email.html',
      content: `${author} has published a new article ${title}`,
      buttonText: 'Read more',
      boxTitle: 'Read more',
      appTitle: this.configService.get('MAIL_APP_NAME'),
      signature: `${this.configService.get('MAIL_APP_NAME')} Team`,
      url,
      publicUrl: this.configService.get('FRONTEND_URL'),
    } as MailSimpleTemplate;

    await this.sendMail(mail);
  }

  async feedAdded(data: any) {
    console.log(data);
    const { text, email, author, user, slug } = data;

    const url = `${this.configService.get(
      'BACKEND_URL'
    )}/${this.configService.get('GLOBAL_PREFFIX')}/blog/post/${slug}`;

    const mail = {
      to: email,
      from: `${this.configService.get(
        'MAIL_APP_NAME'
      )} <${this.configService.get('MAIL_FROM')}>`,
      subject: `${this.configService.get(
        'MAIL_APP_NAME'
      )}  - New feedback ${user}`,
      template: './email.html',
      content: `${user} has added a new feedback to the article ${text}`,
      buttonText: 'Read more',
      boxTitle: 'Read more',
      appTitle: this.configService.get('MAIL_APP_NAME'),
      signature: `${this.configService.get('MAIL_APP_NAME')} Team`,
      url,
      publicUrl: this.configService.get('FRONTEND_URL'),
    } as MailSimpleTemplate;

    await this.sendMail(mail);
  }
  getHello(): string {
    return 'Hello World!';
  }

  private async sendMail(mailContent: MailSimpleTemplate) {
    console.log(mailContent);
    if (!this.configService.get<boolean>('MAIL_ON')) return;
    const {
      to,
      from,
      subject,
      template,
      content,
      buttonText,
      boxTitle,
      appTitle,
      signature,
      url,
      publicUrl,
    } = mailContent;

    await this.mailerService.sendMail({
      to,
      from,
      subject,
      template,
      context: {
        content,
        buttonText,
        boxTitle,
        appTitle,
        signature,
        url,
        publicUrl,
      },
    });
  }
}
