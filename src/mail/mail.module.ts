import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';

@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
      // or
      transport: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        secure: false,
        auth: {
          user: process.env.EMAIL_USERNAME || 'noreply@dimitra.io',
          pass: process.env.EMAIL_PASSWORD || 'wtrp yxvh vqex kyzy',
        },
      },
      defaults: {
        from: '"Team Dimitra" <noreply@dimitra.io>',
      },
      template: {
        dir: __dirname + 'mail/templates',
        adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService], // 👈 export for DI
})
export class MailModule {}
