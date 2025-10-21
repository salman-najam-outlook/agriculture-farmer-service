import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentMitigationService } from './assessment-mitigation.service';

describe('AssessmentMitigationService', () => {
  let service: AssessmentMitigationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssessmentMitigationService],
    }).compile();

    service = module.get<AssessmentMitigationService>(AssessmentMitigationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
