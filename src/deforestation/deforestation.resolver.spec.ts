import { Test, TestingModule } from '@nestjs/testing';
import { DeforestationResolver } from './deforestation.resolver';
import { DeforestationService } from './deforestation.service';

describe('DeforestationResolver', () => {
  let resolver: DeforestationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeforestationResolver, DeforestationService],
    }).compile();

    resolver = module.get<DeforestationResolver>(DeforestationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
