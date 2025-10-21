import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BlendService } from './services/blends.service';
import { BlendResolver } from './resolvers/blend.resolver';
import { Blend } from './entities/blend.entity';
import { BlendProduct } from './entities/blend-product.entity';
import { ContainerDetailService } from '../container-details/services/container-detail.service';
import { ContainerDetail } from '../container-details/entities/container-detail.entity';
import { DiligenceReportService } from 'src/diligence-report/diligence-report.service';
import { TranslationService } from 'src/translation/translation.service';
import { DiligenceReport } from 'src/diligence-report/entities/diligence-report.entity';
import { Translation } from 'src/translation/translation.entity';
import { ExemptProduct } from '../exempt-products/entities/exempt-product.entity';
import { DueDiligenceProductionPlace } from 'src/due-diligence/production-place/entities/production-place.entity';
import { HideDdsReport } from './entities/hide-dds-report';
import { BlendController} from './controllers/blends.controller';
@Module({
  imports: [SequelizeModule.forFeature([Blend, BlendProduct, ContainerDetail, DiligenceReport, ExemptProduct, Translation, DueDiligenceProductionPlace, HideDdsReport])],
  providers: [ BlendService, ContainerDetailService, TranslationService, BlendResolver],
  controllers: [BlendController],
  exports: [BlendService, ContainerDetailService, TranslationService],
})
export class BlendModule {}
