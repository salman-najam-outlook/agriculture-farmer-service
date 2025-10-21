import { Module } from '@nestjs/common';
import { DownloadHistoryResolver } from './download-history.resolver';
import { DownloadHistoryService } from './download-history.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { PdfDownloadHistory } from './entities/pdf-download-history.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PdfDownloadHistory,
    ])
  ],
  providers: [DownloadHistoryResolver, DownloadHistoryService]
})
export class DownloadHistoryModule { }
