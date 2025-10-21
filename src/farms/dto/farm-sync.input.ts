import { FarmType } from "src/due-diligence/production-place/dto/create-production-place.input";
export interface FarmSyncCoordinatesInput {
  latitude: string;
  longitude: string;
}

export interface FarmSyncPointCoordinatesInput {
  centerLatitude?: string;
  centerLongitude?: string;
  radius?: string;
}

export interface FarmSyncInput {
  syncType: 'ADDED' | 'DELETED'  |'UPDATED',
  cfUserId: number;
  cfFarmId: number;
  farmName: string;
  areaInAcre: number;
  farmType: FarmType;
  location: string;
  coordinates?: FarmSyncCoordinatesInput[];
  pointCoordinates?: FarmSyncPointCoordinatesInput;
}

export interface CreateFarmLocationSyncInput {
  farmName?: string;
  area?: number;
  farmType?: FarmType;
  location?: string;
  coordinates?: FarmSyncCoordinatesInput[];
  pointCoordinates?: FarmSyncPointCoordinatesInput;
  farmId: number;
  userId: number;
}
