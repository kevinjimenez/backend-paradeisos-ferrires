import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { envs } from '../../config/envs';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: envs.mailHost,
      port: Number(envs.mailPort),
      secure: false,
      auth: {
        user: envs.mailUser,
        pass: envs.mailPass,
      },
    });
  }

  async sendMail(data: {
    to: string;
    subject: string;
    html: string;
    attachments?: {
      filename: string;
      content: Buffer | string;
      contentType?: string;
      encoding?: string;
    }[];
  }): Promise<void> {
    const { to, subject, html, attachments } = data;
    try {
      await this.transporter.sendMail({
        from: `"No Reply" <${envs.mailFrom}>`,
        to,
        subject,
        html,
        attachments,
      });
      this.logger.log(`Send email to: ${to}`);
    } catch (error) {
      this.logger.error(`Error Send mail ${to}`, error);
      throw new InternalServerErrorException('Error send email');
    }
  }
}
