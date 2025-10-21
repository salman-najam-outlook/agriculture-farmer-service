import { Module } from '@nestjs/common';
import { EnquiryService } from './enquiry.service';
import { EnquiryResolver } from './enquiry.resolver';
import { SequelizeModule } from '@nestjs/sequelize';
import { Enquiry } from './entities/enquiry.entity';
import { Sequelize } from 'sequelize-typescript';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [SequelizeModule.forFeature([Enquiry]), UsersModule],
  providers: [
    EnquiryResolver,
    EnquiryService,
    { provide: 'SEQUELIZE', useExisting: Sequelize },
  ],
  exports: [SequelizeModule],
})
export class EnquiryModule {}
