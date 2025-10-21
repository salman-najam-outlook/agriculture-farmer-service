import { Test, TestingModule } from '@nestjs/testing';
import { SegmentResolver } from './segment.resolver';
import { SegmentService } from './segment.service';

describe('SegmentResolver', () => {
  let resolver: SegmentResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SegmentResolver, SegmentService],
    }).compile();

    resolver = module.get<SegmentResolver>(SegmentResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
