import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ManageProduct } from './entities/manage-products.entity';
import { ProductService } from './services/product.service';
import { ProductResolver } from './resolvers/product.resolver';
import { ManageSubproduct } from './entities/manage-subproduct.entity';
import { SubproductService } from './services/subproduct.service';
import { SubproductResolver } from './resolvers/subproduct.resolver';
import { DocumentCode } from './entities/document-code.entity';
import { DocumentCodeService } from './services/document-code.service';
import { DocumentCodeResolver } from './resolvers/document-code.resolver';
@Module({
  imports: [SequelizeModule.forFeature([ManageProduct, ManageSubproduct, DocumentCode])],
  providers: [ProductService, SubproductService, ProductResolver, SubproductResolver, DocumentCodeResolver, DocumentCodeService],
  controllers: [],
  exports: [ProductService, SubproductService, DocumentCodeService],
})
export class ProductsModule {}
