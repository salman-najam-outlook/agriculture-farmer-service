import { Test, TestingModule } from '@nestjs/testing';
import { ProductionPlaceController } from './production-place.controller';

describe('ProductionPlaceController', () => {
  let controller: ProductionPlaceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionPlaceController],
    }).compile();

    controller = module.get<ProductionPlaceController>(ProductionPlaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
