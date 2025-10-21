import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { MailModule } from 'src/mail/mail.module';
import { Assesment } from './entities/assessment.entity';
import { AssesmentResolver } from './assessment.resolver';
import { AssesmentService } from './assessment.service';

@Module({
  imports: [
    MailModule,
    SequelizeModule.forFeature([
      Assesment
    ]),
  ],
  providers: [
    AssesmentResolver,
    AssesmentService,
    { provide: 'SEQUELIZE', useExisting: Sequelize },
  ],
  exports: [SequelizeModule],
})
export class AssesmentModule {}
