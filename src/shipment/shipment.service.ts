
import {DiligenceReport} from "../diligence-report/entities/diligence-report.entity";
import {GetShipmentInput, ShipmentDiligenceReportsFilterInput} from "./dto/get-shipment";

import { Inject, Injectable, HttpException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { Shipment } from "./entities/shipment.entity";
import { ShipmentStop } from "./entities/shipment-stop.entity";
import { ShipmentDueDeligenceReport } from "./entities/shipment-duedeligence-report.entity";
import { Op } from "sequelize";
import { CreateShipmentInput, UpdateShipment } from "./dto/create-shipment";
import { GetAllShipmentListInput } from "./dto/list-shipment";
import { UserDDS } from "src/users/entities/dds_user.entity";
import { DiligenceReportProductionPlace } from 'src/diligence-report/entities/diligence-report-production-place.entity';
import { DueDiligenceProductionPlace } from 'src/due-diligence/production-place/entities/production-place.entity';
import { ProductionPlaceDeforestationInfo } from 'src/due-diligence/production-place/entities/production-place-deforestation-info.entity';
import { BulkAssignShipmentsInput, BulkApproveShipmentsInput, BulkRejectShipmentsInput, BulkOperationResponse } from './dto/bulk-operations.input';
import { STATUS_LEGENDS } from '../constants/status-legends.constant';
import { DiligenceReportService } from "src/diligence-report/diligence-report.service";

@Injectable()
export class ShipmentService {
  constructor(
    @InjectModel(Shipment)
    private readonly shipmentModel: typeof Shipment,


    @Inject('SEQUELIZE')
    private readonly sequelize: Sequelize,

    @InjectModel(DiligenceReport)
    private readonly DiligenceReportModel: typeof DiligenceReport,

    @InjectModel(DiligenceReportProductionPlace)
    private readonly DiligenceReportProductionPlaceModel: typeof DiligenceReportProductionPlace,

    @InjectModel(DueDiligenceProductionPlace)
    private readonly DueDiligenceProductionPlaceModel: typeof DueDiligenceProductionPlace,

    @InjectModel(ProductionPlaceDeforestationInfo)
    private readonly ProductionPlaceDeforestationInfoModel: typeof ProductionPlaceDeforestationInfo,

    private readonly diligenceService: DiligenceReportService

  ) {}

  async findAll(getAllShipmentListInput: GetAllShipmentListInput, userId:number, organizationId: number, subOrganizationId?: number) {
    let { page = 1, limit = 10, search="", orderField, order, assignedTo, assignedToIds, status, cfroles = [] } = getAllShipmentListInput;
    let where:any = {
      organization_id: organizationId
    }
    if(subOrganizationId){
      where.subOrganizationId = parseInt(subOrganizationId.toString());
    }
    // Handle assignedTo filter - support both single and multiple values
    if (assignedToIds && assignedToIds.length > 0) {
      where.assignedTo = { [Op.in]: assignedToIds };
    } else if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    if (status) {
      where.status = status;
    }

    if(cfroles?.length == 1 && (cfroles?.includes('indonesia_ptsi_worker') || cfroles?.includes('kenya_ptsi_worker'))){
      where.assignedTo = userId
    }
    
    const formattedOrder = order ? order.toUpperCase() : null;
    if(search){
       where.id = {
         [Op.like]: `%${search}`
       }
    }
    const query = {     
      include: [
        {
          model: ShipmentDueDeligenceReport,
          as: "shipmentReports",
          include: [
            {
              model: DiligenceReport,
              include:[
                {
                  model: DiligenceReportProductionPlace,
                  where:{ 
                      removed: 0
                  },
                  required: false,
                }
              ]
            },
          ],
        },
        {
          model: UserDDS,
          as: 'assignedToUser',
          required: false,
          attributes: ['id', 'firstName', 'lastName', 'email', 'cf_userid']
        }
      ],
      offset: 0,
      limit: 10,
      where,
      distinct: true,
      col: 'id',
      order: null
    };
    let formatMap = {
      shipmentID: "id",
    }
    if (orderField === 'shipmentID') {
      orderField = formatMap[orderField]
    }
    if(orderField && order) {
      query.order = [[orderField, formattedOrder]]
    } else {
      query.order = [["createdAt", "DESC"]]
    }
    if (page && limit) {
      limit = limit;
      query.offset = (page - 1) * limit;
      query.limit = limit;
    }
    let res: { count: any; rows: any };
    res = await this.shipmentModel.findAndCountAll(query);
    return res;
  }

  async findOne(getShipment: GetShipmentInput) {
    const {id,shipment_status,eudr_search,eudr_status}=getShipment
    const shipmentWhere:any ={ id:id}
    if(shipment_status !== undefined){
      shipmentWhere.status = shipment_status
    }
    const eudrWhere: any = {};
    if (eudr_search !== undefined) {
      eudrWhere[Op.or] = [
        { internalReferenceNumber: { [Op.like]: `%${eudr_search}%` } },
        { EUDRReferenceNumber: { [Op.like]: `%${eudr_search}%` } },
        { activity: { [Op.like]: `%${eudr_search}%` } },
        { product: { [Op.like]: `%${eudr_search}%` } },
      ];
    }
    if(eudr_status !== undefined){
      eudrWhere.status=eudr_status
    }
    const shipmentDetail = await this.shipmentModel.findOne({
      where: {
        id,
      },
      include: [
        {
          where:eudrWhere,
          model: DiligenceReport,
          through: {  },
          as: 'due_diligences',
          required:false
        },
        {
          model: ShipmentStop,
          as: "shipment_stops",
          required:false
        },
        {
          model: UserDDS,
          as: 'assignedToUser',
          required: false
        }
      ],
    });
    if (!shipmentDetail) {
      throw new Error("Shipment not found");
    }
    return shipmentDetail;
  }

  async updateShipmentStatus(updateShipment: UpdateShipment) {
    let transaction =  await this.sequelize.transaction();
    try {
      let { id, status } = updateShipment;
      let shipment =  await this.shipmentModel.update({ status }, 
        { 
          where : { id },
          transaction,
        })

      await transaction.commit();
      return shipment;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async create(createShipment: CreateShipmentInput, orgId: number,subOrganizationId=null):Promise<Shipment> {
    let transaction = await this.sequelize.transaction();
    try {
      if(!createShipment.status) createShipment.status = null;
      const shipment = await this.shipmentModel.create(
        { ...createShipment, organization_id: orgId, subOrganizationId },
        {
          transaction,
        }
      );

      if (
        createShipment.shipment_stops &&
        createShipment.shipment_stops.length
      ) {
        const stops = createShipment.shipment_stops.map((x) => {
          return {
            shipment_id: shipment.id,
            title: x.title,
          };
        });
        const stopsModel = this.sequelize.model(ShipmentStop);
        await stopsModel.bulkCreate(stops, { transaction });
      }

      if (
        createShipment.due_deligence_report_ids &&
        createShipment.due_deligence_report_ids.length
      ) {
        const reportIds = createShipment.due_deligence_report_ids.map((x) => {
          return {
            shipment_id: shipment.id,
            due_deligence_report_id: x.due_deligence_report_id,
          };
        });
        const dueDeligenceReport = this.sequelize.model(
          ShipmentDueDeligenceReport
        );
        await dueDeligenceReport.bulkCreate(reportIds, { transaction });
      }

      await transaction.commit();
      return shipment;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }



  async diligenceReportByShipment(filter?: ShipmentDiligenceReportsFilterInput) {
    const page = filter.page;
    let limit = filter.limit;
    const shipment_id = filter.shipment_id

    let { orderField, order } = filter

    const formattedOrder = order ? order.toUpperCase() : null;

    const query = {
      offset: 0,
      limit: 10,
      order: null
    };
    if(orderField && order) {
      query.order = [[orderField, formattedOrder]]
    } else {
      query.order = [["createdAt", "DESC"]]
    }

    if (page && limit) {
      query.offset = (page - 1) * limit;
      query.limit = limit;
    }
    const where: any = {};
    const shipmentWhere:any ={ id:shipment_id};


    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.country && filter.country != "All Countries") {
      where.countryOfEntry = filter.country;
    }


    if (filter.searchPhrase) { // include[1].where["internalReferenceNumber"] = { [Op.like]: `%${filter.searchPhrase}%` };
      where.EUDRReferenceNumber = {
        [Op.like]: `%${filter.searchPhrase
        }%`
      };
    }

    if(filter.supplierId){
      where.supplierId = filter.supplierId;
    }

    let response: { totalCount?: any; count: any; rows: any };
    response = await this.DiligenceReportModel.findAndCountAll({
      where,
      // include,
      include:[
        {
          model: UserDDS,
          required:false,
          attributes:['id','firstName','lastName', 'eori_number'],
          as:'supplier'
        },
        {
          model: UserDDS,
          required:false,
          attributes:['id','firstName','lastName', 'eori_number'],
          as : 'operator'
        },
        {
          model: UserDDS,
          required:false,
          attributes:['id','firstName','lastName', 'eori_number'],
          as : 'assignedToUser'
        },
        {
          model: DiligenceReportProductionPlace,
          where:{removed:0}
        },
        {
          where:shipmentWhere,
          model: Shipment,
          through: {  },
          as: 'shipment',
          required:true
        },
      ],
      ...query
    });

    response.totalCount = response.count;
    response.count = response.rows.length;


    return response;
  }

  async bulkAssignShipments(
    shipmentIds: number[],
    assignedTo: number,
    assignedToCfId: number,
  ): Promise<BulkOperationResponse> {
    const transaction = await this.sequelize.transaction();
    const failedShipmentIds: number[] = [];
    let processedCount = 0;

    try {
      for (const shipmentId of shipmentIds) {
        try {
          const shipment = await this.shipmentModel.findByPk(shipmentId, { 
            include: [{
              model: ShipmentDueDeligenceReport,
              as: "shipmentReports",
              include: [{
                model: DiligenceReport,
                as: "dueDeligenceReport"
              }]
            }],
            transaction 
          });
          
          if (!shipment) {
            failedShipmentIds.push(shipmentId);
            continue;
          }

          // Update shipment assignment
          await this.shipmentModel.update(
            {
              assignedTo: assignedTo,
              assignedToCfId: assignedToCfId,
              assignedDate: new Date(),
              statusLegends: STATUS_LEGENDS.PENDING_APPROVAL,
            },
            {
              where: { id: shipmentId },
              transaction,
            }
          );

          // Assign all reports within this shipment to the same user
          if (shipment.shipmentReports && shipment.shipmentReports.length > 0) {
            const reportIds = shipment.shipmentReports
              .map(sr => sr.dueDeligenceReport?.id)
              .filter(id => id !== null && id !== undefined);

            if (reportIds.length > 0) {
              await this.DiligenceReportModel.update(
                {
                  assignedTo: assignedTo,
                  assignedToCfId: assignedToCfId,
                  assignedDate: new Date(),
                  statusLegends: STATUS_LEGENDS.PENDING_APPROVAL,
                  temporaryExpirationDate: null,
                  temporaryExpirationValue: null,
                  temporaryExpirationUnit: null,
                  isTemporaryApproval: false,
                  rejectionReason: null,
                },
                {
                  where: { id: { [Op.in]: reportIds } },
                  transaction,
                }
              );
            }
          }

          processedCount++;
        } catch (error) {
          console.error(`Error assigning shipment ${shipmentId}:`, error);
          if (error instanceof HttpException) {
            throw error;
          }
          failedShipmentIds.push(shipmentId);
        }
      }

      await transaction.commit();

      return {
        success: failedShipmentIds.length === 0,
        message: `Successfully assigned ${processedCount} shipments and their associated reports${failedShipmentIds.length > 0 ? `, ${failedShipmentIds.length} failed` : ''}`,
        processedCount,
        failedReportIds: failedShipmentIds.length > 0 ? failedShipmentIds : undefined,
      };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Failed to assign shipments: ${error.message}`, 500);
    }
  }

  /**
   * Update production places status during temporary approval for shipment
   */
  public async updateProductionPlacesForTemporaryApprovalForShipment(
  reportId: number, 
  expirationDate: Date
) {
  try {
    // Get all production places for this report
    const productionPlaces = await this.DiligenceReportProductionPlaceModel.findAll({
      where: {
        diligenceReportId: reportId,
        removed: false
      },
      include: [
        {
          model: this.DueDiligenceProductionPlaceModel,
          as: 'productionPlace'
        },
        {
          model: this.ProductionPlaceDeforestationInfoModel,
          as: 'productionPlaceDeforestationInfo'
        }
      ]
    });

    // Run updates in parallel
    await Promise.all(
      productionPlaces.map(async (reportProductionPlace) => {
        const productionPlace = reportProductionPlace.productionPlace;

        if (productionPlace && reportProductionPlace.productionPlaceDeforestationInfoId) {
          const originalDeforestationStatus = reportProductionPlace.productionPlaceDeforestationInfo?.deforestationStatus;

          if(originalDeforestationStatus != 'Zero/Negligible Deforestation Probability'){
            return this.ProductionPlaceDeforestationInfoModel.update({
              deforestationStatus: 'Manually Mitigated',
              lastDeforestationMitigationDate: new Date(),
              originalDeforestationStatusForTemporaryApproval: originalDeforestationStatus
            },{
              where: { id: reportProductionPlace.productionPlaceDeforestationInfoId }
            });
          }
        }
        return null; // no update needed
      })
    );
  } catch (error) {
    console.error(
      'Error updating production places for temporary approval for shipment:',
      error
    );
    throw error;
  }
}  


  
  async bulkApproveShipments(input: BulkApproveShipmentsInput): Promise<{jobs:any, success:boolean}> {
    const transaction = await this.sequelize.transaction();
    const failedShipmentIds: number[] = [];
    let processedCount = 0;
    try {
      const { shipmentIds, isTemporaryApproval = false, approvalExpirationValue, approvalExpirationUnit } = input;
      const diligenceReportIds = []

      const reportUpdateData: any = {
          statusLegends: isTemporaryApproval ? STATUS_LEGENDS.TEMPORARY_APPROVED : STATUS_LEGENDS.APPROVED,
          isTemporaryApproval,
      };
      let expirationDate =  new Date();
      if (isTemporaryApproval) {
          const currentDate = new Date();
          const expirationValue = approvalExpirationValue || 26;
          const expirationUnit = approvalExpirationUnit || 'days';
          // Calculate expiration date based on input values
          switch (expirationUnit) {
            case 'days':
              expirationDate.setDate(currentDate.getDate() + expirationValue);
              break;
            case 'months':
              expirationDate.setMonth(currentDate.getMonth() + expirationValue);
              break;
            case 'years':
              expirationDate.setFullYear(currentDate.getFullYear() + expirationValue);
              break;
            default:
              expirationDate.setDate(currentDate.getDate() + expirationValue);
          }
          
          reportUpdateData.temporaryExpirationDate = expirationDate;
          reportUpdateData.temporaryExpirationValue = expirationValue;
          reportUpdateData.temporaryExpirationUnit = expirationUnit;
          reportUpdateData.assignedTo = null;
          reportUpdateData.assignedToCfId = null;
          reportUpdateData.assignedDate = null;
          reportUpdateData.rejectionReason = null;
       }

      for (const shipmentId of shipmentIds) {
        try {
          const shipment = await this.shipmentModel.findByPk(shipmentId, { 
            include: [{
              model: ShipmentDueDeligenceReport,
              as: "shipmentReports",
              include: [{
                model: DiligenceReport,
                as: "dueDeligenceReport"
              }]
            }] 
          });
          
          if (!shipment) {
            failedShipmentIds.push(shipmentId);
            continue;
          }

          shipment.statusLegends = isTemporaryApproval ? STATUS_LEGENDS.TEMPORARY_APPROVED : STATUS_LEGENDS.APPROVED;
          shipment.isTemporaryApproval = isTemporaryApproval;

          

          if (isTemporaryApproval) {
            const currentDate = new Date();
            const expirationValue = approvalExpirationValue || 26;
            const expirationUnit = approvalExpirationUnit || 'days';
            
            // Calculate expiration date based on input values
            let expirationDate = new Date(currentDate);
            switch (expirationUnit) {
              case 'days':
                expirationDate.setDate(currentDate.getDate() + expirationValue);
                break;
              case 'months':
                expirationDate.setMonth(currentDate.getMonth() + expirationValue);
                break;
              case 'years':
                expirationDate.setFullYear(currentDate.getFullYear() + expirationValue);
                break;
              default:
                expirationDate.setDate(currentDate.getDate() + expirationValue);
            }
            
            shipment.temporaryExpirationDate = expirationDate;
            shipment.temporaryExpirationValue = expirationValue;
            shipment.temporaryExpirationUnit = expirationUnit;
            shipment.assignedTo = null;
            shipment.assignedToCfId = null;
            shipment.assignedDate = null;
            shipment.rejectionReason = null;
          }

          // Update shipment approval
         await shipment.save();

          // Approve all reports within this shipment
          if (shipment.shipmentReports && shipment.shipmentReports.length > 0) {
            const reportIds = shipment.shipmentReports
              .map(sr => sr.dueDeligenceReport?.id)
              .filter(id => id !== null && id !== undefined);
            if (reportIds.length > 0) {
              diligenceReportIds.push(...reportIds);
            }
          }

          processedCount++;
        } catch (error) {
          console.error(`Error processing shipment ${shipmentId}:`, error);
          if (error instanceof HttpException) {
            throw error;
          }
          failedShipmentIds.push(shipmentId);
        }
      }

      await this.DiligenceReportModel.update(reportUpdateData, {
              where: { id: { [Op.in]: diligenceReportIds } },
      });

      const jobs = [];

      for (const reportId of diligenceReportIds) {
        try {
         if(isTemporaryApproval){
            await this.updateProductionPlacesForTemporaryApprovalForShipment(reportId, expirationDate);
         }
         const job =  await this.diligenceService.generateComplianceByDiligenceIdForApproval({
            diligenceId: reportId,
            isTemporaryApproval,
          });
          jobs.push(job);
        } catch (error) {
          console.error(`Error generating compliance for report ${reportId}:`, error);
        }
      }




      return {
            jobs:(jobs || []).filter((j) => j !== null),
            success:true
      }
      // return {
      //   success: failedShipmentIds.length === 0,
      //   message: `Successfully approved ${processedCount} shipments and their associated reports${failedShipmentIds.length > 0 ? `, ${failedShipmentIds.length} failed` : ''}`,
      //   processedCount,
      //   failedReportIds: failedShipmentIds.length > 0 ? failedShipmentIds : undefined,
      // };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Failed to approve shipments: ${error.message}`, 500);
    }
  }

  async bulkRejectShipments(input: BulkRejectShipmentsInput): Promise<BulkOperationResponse> {
    const transaction = await this.sequelize.transaction();
    const failedShipmentIds: number[] = [];
    let processedCount = 0;

    try {
      const { shipmentIds, reason } = input;

      for (const shipmentId of shipmentIds) {
        try {
          const shipment = await this.shipmentModel.findByPk(shipmentId, { 
            include: [{
              model: ShipmentDueDeligenceReport,
              as: "shipmentReports",
              include: [{
                model: DiligenceReport,
                as: "dueDeligenceReport"
              }]
            }],
            transaction 
          });
          
          if (!shipment) {
            failedShipmentIds.push(shipmentId);
            continue;
          }

          // Update shipment rejection
          await this.shipmentModel.update(
            {
              statusLegends: STATUS_LEGENDS.REJECTED,
              rejectionReason: reason,
            },
            {
              where: { id: shipmentId },
              transaction,
            }
          );

          // Reject all reports within this shipment
          if (shipment.shipmentReports && shipment.shipmentReports.length > 0) {
            const reportIds = shipment.shipmentReports
              .map(sr => sr.dueDeligenceReport?.id)
              .filter(id => id !== null && id !== undefined);

            if (reportIds.length > 0) {
              await this.DiligenceReportModel.update(
                {
                  statusLegends: STATUS_LEGENDS.REJECTED,
                  rejectionReason: reason,
                  assignedTo: null,
                  assignedToCfId: null,
                  assignedDate: null,
                  temporaryExpirationDate: null,
                  temporaryExpirationValue: null,
                  temporaryExpirationUnit: null,
                  isTemporaryApproval: false,
                },
                {
                  where: { id: { [Op.in]: reportIds } },
                  transaction,
                }
              );
            }
          }

          processedCount++;
        } catch (error) {
          console.error(`Failed to reject shipment ${shipmentId}:`, error);
          if (error instanceof HttpException) {
            throw error;
          }
          failedShipmentIds.push(shipmentId);
        }
      }

      await transaction.commit();

      return {
        success: failedShipmentIds.length === 0,
        message: `Successfully rejected ${processedCount} shipments and their associated reports${failedShipmentIds.length > 0 ? `, ${failedShipmentIds.length} failed` : ''}`,
        processedCount,
        failedReportIds: failedShipmentIds.length > 0 ? failedShipmentIds : undefined,
      };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Failed to reject shipments: ${error.message}`, 500);
    }
  }

}
