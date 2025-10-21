import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentBuilderResolver } from './assessment-builder.resolver';
import { AssessmentBuilderService } from './assessment-builder.service';

describe('AssessmentBuilderResolver', () => {
  let resolver: AssessmentBuilderResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssessmentBuilderResolver, AssessmentBuilderService],
    }).compile();

    resolver = module.get<AssessmentBuilderResolver>(AssessmentBuilderResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
