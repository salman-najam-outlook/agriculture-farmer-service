import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ExemptProductService } from './services/exempt-product.service';
import { ExemptProductResolver } from './resolvers/exempt-product.resolver';
import { ExemptProduct } from './entities/exempt-product.entity';
import { ExemptProductController } from './exempt-product.controller';
import { ContainerDetail } from '../container-details/entities/container-detail.entity';
import { ContainerDetailService } from '../container-details/services/container-detail.service';

@Module({
  imports: [SequelizeModule.forFeature([ExemptProduct, ContainerDetail])],
  providers: [ExemptProductService, ContainerDetailService, ExemptProductResolver],
  exports: [ExemptProductService, ContainerDetailService],
  controllers: [ExemptProductController]
})
export class ExemptProductsModule {}
