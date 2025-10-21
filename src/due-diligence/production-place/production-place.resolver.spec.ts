import { Test, TestingModule } from '@nestjs/testing';
import { ProductionPlaceResolver } from './production-place.resolver';

describe('ProductionPlaceResolver', () => {
  let resolver: ProductionPlaceResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductionPlaceResolver],
    }).compile();

    resolver = module.get<ProductionPlaceResolver>(ProductionPlaceResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
