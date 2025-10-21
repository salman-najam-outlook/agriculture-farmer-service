import { Op } from "sequelize";
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ContainerDetail } from "../entities/container-detail.entity";

@Injectable()
export class ContainerDetailService {
  constructor(@InjectModel(ContainerDetail) private readonly containerDetailModel: typeof ContainerDetail) {}

  async attachContainersByEntity(inputContainerIds, entity, columnName) {
    const dbContainerIds = await this.containerDetailModel.findAll({
      attributes: ['containerId'],
      where: {
        [columnName]: {
            [Op.not]: null,
        },
        containerId: inputContainerIds
      },
    })

    const containerIds = dbContainerIds.map((dbContainerId: ContainerDetail) => dbContainerId.containerId);

    await this.containerDetailModel.bulkCreate(
      inputContainerIds.map((containerId) => {
        return {
          containerId,
          [columnName]:  entity.id,
        }
      })
    );
  }

  async syncContainersByEntity(containerIds, entity, columnName) {
    const dbContainerIds = await this.containerDetailModel.findAll({
      attributes: ['containerId', columnName],
      where: {
        [columnName]: {
            [Op.not]: null,
        },
        containerId: containerIds
      },
    })


   

    await this.containerDetailModel.destroy({ where: { [columnName]: entity.id }, force: true });

    await this.containerDetailModel.bulkCreate(
      containerIds.map((containerId) => {
        return {
          containerId,
          [columnName]:  entity.id
        }
      })
    );
  }

  async softDeleteByExemptProductId(exemptProductId: number): Promise<void> {
     await this.containerDetailModel.destroy({
      where: {
        exemptProductId: exemptProductId
      }
    });
  }
}
