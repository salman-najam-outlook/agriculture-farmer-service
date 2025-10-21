import { Inject, Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Assesment } from './entities/assessment.entity';

@Injectable()
export class AssesmentService {
  constructor(
    @InjectModel(Assesment)
    private AssesmentModel: typeof Assesment,

    @Inject('SEQUELIZE')
    private readonly sequelize: Sequelize,
  ) {}

  async findAll() {
    const assessents =  await this.AssesmentModel.findAll();
    return assessents;
  }

}
