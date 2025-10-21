import { Test, TestingModule } from '@nestjs/testing';
import { DeforestationService } from './deforestation.service';

describe('DeforestationService', () => {
  let service: DeforestationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeforestationService],
    }).compile();

    service = module.get<DeforestationService>(DeforestationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
