import { Module, Logger } from "@nestjs/common";
import { MongoClient } from 'mongodb';
import { MONGO_DB } from "src/config/constant";
import { OfflineSyncController } from "./offline-sync.controller";
import { OfflineSyncService } from "./offline-sync.service";

@Module({
  providers: [
    {
      provide: 'MONGO_CLIENT',
      useFactory: async () => {
        const mongoUrl = MONGO_DB?.URL;
        if (!mongoUrl) {
          Logger.log('MONGO_URL environment variable is not defined or invalid');
        }
        try {
          const client = new MongoClient(mongoUrl);
          await client.connect();
          return client;
        } catch (error) {
          console.log(error);
          return null;
        }
      },
    },
    OfflineSyncService
  ],
  controllers: [
    OfflineSyncController
  ]
})
export class OfflineSyncModule {}
