import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentUploadResolver } from '../assessment-builder/assessment-upload.resolver';

describe('AssessmentUploadResolver', () => {
  let resolver: AssessmentUploadResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssessmentUploadResolver],
    }).compile();

    resolver = module.get<AssessmentUploadResolver>(AssessmentUploadResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
