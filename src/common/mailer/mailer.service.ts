import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private mailerService: NestMailerService) {}
  async sendVerificationCode(to: string, subject: string, code: number) {
    await this.mailerService.sendMail({
      to,
      subject,
      template: 'verification-code',
      context: {
        code,
      },
    });
  }
}
