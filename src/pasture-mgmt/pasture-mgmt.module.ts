import { Module } from '@nestjs/common';
import { PastureMgmtService } from './pasture-mgmt.service';
import { PastureMgmtResolver } from './pasture-mgmt.resolver';
import { PastureMgmt } from './entities/pasture-mgmt.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { PastureMgmtCoordinates } from './entities/pasture-mgmt-coordinates.entity';
import { ReportTypes } from './entities/report-types.entity';
import { Sequelize } from 'sequelize-typescript';
import { PasterManagementController } from './pasture-mgmt.controller';
import { S3Service } from '../upload/upload.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    MailModule,
    SequelizeModule.forFeature([
      PastureMgmt,
      PastureMgmtCoordinates,
      ReportTypes,
    ]),
  ],
  controllers: [PasterManagementController],
  providers: [
    PastureMgmtResolver,
    PastureMgmtService,
    { provide: 'SEQUELIZE', useExisting: Sequelize },
    S3Service,
  ],
  exports: [SequelizeModule],
})
export class PastureMgmtModule {}
