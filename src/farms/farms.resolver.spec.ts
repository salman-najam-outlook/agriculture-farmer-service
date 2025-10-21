import { Test, TestingModule } from '@nestjs/testing';
import { FarmsResolver } from './farms.resolver';
import { FarmsService } from './farms.service';

describe('FarmsResolver', () => {
  let resolver: FarmsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FarmsResolver, FarmsService],
    }).compile();

    resolver = module.get<FarmsResolver>(FarmsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
