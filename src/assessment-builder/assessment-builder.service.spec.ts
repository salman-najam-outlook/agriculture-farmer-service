import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentBuilderService } from './assessment-builder.service';

describe('AssessmentBuilderService', () => {
  let service: AssessmentBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssessmentBuilderService],
    }).compile();

    service = module.get<AssessmentBuilderService>(AssessmentBuilderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
