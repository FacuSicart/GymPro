import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { Environment } from '../config/env.validation';

type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

@Injectable()
export class MailService {
  constructor(private readonly config: ConfigService<Environment, true>) {}

  async sendMail(input: SendMailInput) {
    const host = this.config.get('SMTP_HOST');
    const from = this.config.get('SMTP_FROM_EMAIL');

    if (!host || !from) {
      throw new ServiceUnavailableException('Transactional email is not configured.');
    }

    const port = this.config.get('SMTP_PORT');
    const user = this.config.get('SMTP_USER');
    const pass = this.config.get('SMTP_PASS');
    const secure = this.config.get('SMTP_SECURE');
    const fromName = this.config.get('SMTP_FROM_NAME');

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });

    await transporter.sendMail({
      from: fromName ? `"${fromName}" <${from}>` : from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
  }
}
