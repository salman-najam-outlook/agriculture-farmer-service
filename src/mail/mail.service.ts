import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import hbs from 'handlebars';
import { emailParams } from './mail.interface';
const moment = require('moment');

interface EmailParams {
  toEmail: string;
  subject: string;
  contentParams: Record<string, any>;
}

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendRegisteredUserList(users: []) {
    await this.mailerService.sendMail({
      to: 'jon@dimitra.io,peter@dimitra.io,sujan@dimitra.io,sandesh@dimitra.io,raunak@dimitra.io',
      subject: `LG Daily user registration list - ${moment().format(
        'YYYY-MM-DD',
      )} `,
      template:
        __dirname.replace('/src/mail', '/mail') +
        '/templates/registeredUserList',
      context: {
        users,
      },
      // html: '<b>welcome</b>', // HTML body content
    });
  }

  async getTemplateHtml(_templateName: string) {
    try {
      return fs.readFileSync(
        path.join(
          __dirname.replace('\\src\\mail', '\\mail') +
            `/templates/${_templateName}.html`,
        ),
        'utf8',
      );
    } catch (err) {
      console.error('Error loading HTML template:', err);
      throw new Error('Could not load HTML template');
    }
  }

  async sendEmail(_templateName: string, params: emailParams) {
    try {
      const template = await this.getTemplateHtml(_templateName);
      const compiledTemplate = hbs.compile(template, { strict: false });
      const html = compiledTemplate(params.contentParams);

      const email = await this.mailerService.sendMail({
        to: params.toEmail,
        subject: params.subject,
        html: html,
      });
      Logger.log('Email sent successfully:', email);
    } catch (error) {
      Logger.log('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendEjsEmail( params: emailParams) {
    try {
      const email = await this.mailerService.sendMail({
        to: params.toEmail,
        subject: params.subject,
        html: params.contentParams.htmlContent,
      });
      Logger.log('Email sent successfully:', email);
    } catch (error) {
      Logger.log('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendEjsEmailWithAttachment( params: emailParams, attachments: any[] = []) {
    try {
      const formattedAttachments = attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType || 'application/pdf',
        encoding: 'base64'
      }));

      const email = await this.mailerService.sendMail({
        to: params.toEmail,
        subject: params.subject,
        html: params.contentParams.htmlContent,
        attachments: formattedAttachments,
      });
      Logger.log('Email sent successfully:', email);
    } catch (error) {
      Logger.log('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendEmailWithAttachment(templateName: string, params: EmailParams, attachments: any[] = []) {
    try {
      const template = await this.getTemplateHtml(templateName);
      const compiledTemplate = hbs.compile(template, { strict: false });
      const html = compiledTemplate(params.contentParams);

      const formattedAttachments = attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: 'application/pdf',
        encoding: 'base64'
      }));

      await this.mailerService.sendMail({
        to: params.toEmail,
        subject: params.subject,
        html,
        attachments: formattedAttachments,
      });

      Logger.log(`Email sent successfully with ${attachments.length} attachments.`);
    } catch (error) {
      Logger.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
