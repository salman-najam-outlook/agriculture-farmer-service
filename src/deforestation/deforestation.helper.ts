import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { DeforestationReportRequest } from "./entities/deforestation_report_request.entity";
import { Op, where } from "sequelize";

@Injectable()

export class DeforestationHelperService{
    constructor(
        @InjectModel(DeforestationReportRequest)
        private deforestationReportRequestModel: typeof DeforestationReportRequest,
    ){}

    async getDeforestationReportCount(userId:number,farmId:number,filter:string):Promise<number>{
        const whereCondition:any={
            isDeleted:0,
        };

        if(userId){
            whereCondition.userId = userId;
        }

        if(farmId){
            whereCondition.farmId = farmId;
        }

        switch (filter) {
            case 'day(s)':
              const currentDate = new Date();
              currentDate.setHours(0, 0, 0, 0); // Set time to midnight
              whereCondition.createdAt = {
                [Op.gte]: currentDate,
              };
              break;
          
            case 'week(s)':
              const oneWeekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
              oneWeekAgo.setHours(0, 0, 0, 0); // Set time to midnight
              whereCondition.createdAt = {
                [Op.gte]: oneWeekAgo,
              };
              break;
          
            case 'month(s)':
              const oneMonthAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
              oneMonthAgo.setHours(0, 0, 0, 0); // Set time to midnight
              whereCondition.createdAt = {
                [Op.gte]: oneMonthAgo,
              };
              break;
          
            case 'year(s)':
              const oneYearAgo = new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000);
              oneYearAgo.setHours(0, 0, 0, 0); // Set time to midnight
              whereCondition.createdAt = {
                [Op.gte]: oneYearAgo,
              };
              break;
          
            default:
              break;
          }

        const deforestationReportCount = await this.deforestationReportRequestModel.count({
            where: whereCondition,
        })

        return deforestationReportCount || 0;
    }
}