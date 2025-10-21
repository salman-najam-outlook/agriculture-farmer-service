import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { MailModule } from 'src/mail/mail.module';
import { Product } from './entities/product.entity';
import { SubProduct } from './entities/sub-product.entity';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';
import { TranslationModule } from 'src/translation/translation.module';
import { ManageProduct } from 'src/due-diligence/blend/manage-products/entities/manage-products.entity';
import { ManageSubproduct } from 'src/due-diligence/blend/manage-products/entities/manage-subproduct.entity';

@Module({
  imports: [
    MailModule,
    TranslationModule,
    SequelizeModule.forFeature([
      ManageProduct,
      ManageSubproduct
    ]),
  ],
  providers: [
    ProductResolver,
    ProductService,
    { provide: 'SEQUELIZE', useExisting: Sequelize },
  ],
  exports: [SequelizeModule],
})
export class ProductModule {}
