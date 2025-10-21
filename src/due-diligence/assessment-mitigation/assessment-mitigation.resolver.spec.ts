import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentMitigationResolver } from './assessment-mitigation.resolver';
import { AssessmentMitigationService } from './assessment-mitigation.service';

describe('AssessmentMitigationResolver', () => {
  let resolver: AssessmentMitigationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssessmentMitigationResolver, AssessmentMitigationService],
    }).compile();

    resolver = module.get<AssessmentMitigationResolver>(AssessmentMitigationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
