import { Module } from "@nestjs/common";
import { MessageQueueingService } from "./message-queueing.service";
import { UsersModule } from "src/users/users.module";
import { FarmsModule } from "src/farms/farms.module";
import { TestController } from "./test.controller";

@Module({
  imports: [UsersModule, FarmsModule],
  controllers:[TestController],
  providers: [MessageQueueingService, ],
  exports: [MessageQueueingService, ],
})
export class MessageQueueingModule {}
