import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UserMetadata } from "./entities/user_metadata.entity";
import { Sequelize } from "sequelize-typescript";
import { MetadataService } from "./metadata.service";

@Module({
    imports: [
        SequelizeModule.forFeature([
            UserMetadata
        ])
    ],
    providers: [
        MetadataService,
        { provide: 'SEQUELIZE', useExisting: Sequelize }
    ],
    exports: [SequelizeModule, MetadataService]
})
export class MetadataModule {}