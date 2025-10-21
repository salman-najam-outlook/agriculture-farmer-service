import { Test, TestingModule } from '@nestjs/testing';
import { MessageQueueingService } from './message-queueing.service';

describe('MessageQueuingService', () => {
  let service: MessageQueueingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessageQueueingService],
    }).compile();

    service = module.get<MessageQueueingService>(MessageQueueingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
