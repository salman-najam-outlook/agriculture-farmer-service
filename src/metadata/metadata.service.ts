import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { UserMetadata } from "./entities/user_metadata.entity";
import { CreateUserMetadataDto } from "./dto/user_metadata.input";
import { Sequelize } from "sequelize-typescript";

@Injectable()
export class MetadataService {
    constructor(
        @InjectModel(UserMetadata)
        private userMetadataModel: typeof UserMetadata,

        @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
    ) {}

    async createUserMetadata(createUserMetadataDto: CreateUserMetadataDto) {
        const transaction = await this.sequelize.transaction();
        try {
            const userMetadata = await this.userMetadataModel.create({...createUserMetadataDto}, { transaction });
            await transaction.commit();
            return userMetadata;
        } catch(error) {
            await transaction.rollback();
            Logger.log(`Failed to insert metadata entry ${JSON.stringify(createUserMetadataDto)}`);
            throw error;
        }
    }

    async findAllUserMetadata(): Promise<UserMetadata[]> {
        return await this.userMetadataModel.findAll();
    }
}