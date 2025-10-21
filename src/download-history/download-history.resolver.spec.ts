import { Test, TestingModule } from '@nestjs/testing';
import { DownloadHistoryResolver } from './download-history.resolver';

describe('DownloadHistoryResolver', () => {
  let resolver: DownloadHistoryResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DownloadHistoryResolver],
    }).compile();

    resolver = module.get<DownloadHistoryResolver>(DownloadHistoryResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
