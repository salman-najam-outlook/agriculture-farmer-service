import { Test, TestingModule } from '@nestjs/testing';
import { EnquiryResolver } from './enquiry.resolver';
import { EnquiryService } from './enquiry.service';

describe('EnquiryResolver', () => {
  let resolver: EnquiryResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnquiryResolver, EnquiryService],
    }).compile();

    resolver = module.get<EnquiryResolver>(EnquiryResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
