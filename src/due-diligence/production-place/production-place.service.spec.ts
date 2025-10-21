import { Test, TestingModule } from '@nestjs/testing';
import { ProductionPlaceService } from './production-place.service';

describe('ProductionPlaceService', () => {
  let service: ProductionPlaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductionPlaceService],
    }).compile();

    service = module.get<ProductionPlaceService>(ProductionPlaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
