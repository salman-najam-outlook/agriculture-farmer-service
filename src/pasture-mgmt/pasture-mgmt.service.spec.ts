import { Test, TestingModule } from '@nestjs/testing';
import { PastureMgmtService } from './pasture-mgmt.service';

describe('PastureMgmtService', () => {
  let service: PastureMgmtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PastureMgmtService],
    }).compile();

    service = module.get<PastureMgmtService>(PastureMgmtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
