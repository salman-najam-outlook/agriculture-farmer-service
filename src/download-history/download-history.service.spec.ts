import { Test, TestingModule } from '@nestjs/testing';
import { DownloadHistoryService } from './download-history.service';

describe('DownloadHistoryService', () => {
  let service: DownloadHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DownloadHistoryService],
    }).compile();

    service = module.get<DownloadHistoryService>(DownloadHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
