import { Test, TestingModule } from '@nestjs/testing';
import { PastureMgmtResolver } from './pasture-mgmt.resolver';
import { PastureMgmtService } from './pasture-mgmt.service';

describe('PastureMgmtResolver', () => {
  let resolver: PastureMgmtResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PastureMgmtResolver, PastureMgmtService],
    }).compile();

    resolver = module.get<PastureMgmtResolver>(PastureMgmtResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
