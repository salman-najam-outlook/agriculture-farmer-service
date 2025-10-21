import { Test, TestingModule } from '@nestjs/testing';
import { GeofenceResolver } from './geofence.resolver';
import { GeofenceService } from './geofence.service';

describe('GeofenceResolver', () => {
  let resolver: GeofenceResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeofenceResolver, GeofenceService],
    }).compile();

    resolver = module.get<GeofenceResolver>(GeofenceResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
