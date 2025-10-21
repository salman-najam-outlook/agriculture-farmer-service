import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ShipmentService } from './shipment.service';
import { Shipment } from './entities/shipment.entity';
import { CreateShipmentInput, UpdateShipment } from './dto/create-shipment';
import { ShipmentListResponse,GetAllShipmentListInput } from './dto/list-shipment';
import {GetShipmentInput, ShipmentDiligenceReportsFilterInput} from "./dto/get-shipment";
import {GetTokenData} from "../decorators/get-token-data.decorator";
import {
  DiligenceReportsPaginatedResponse
} from "../diligence-report/dto/create-diligence-report.input";
import { BulkAssignShipmentsInput, BulkApproveShipmentsInput, BulkRejectShipmentsInput, BulkOperationResponse } from './dto/bulk-operations.input';
import { BulkApproveBlockchainReportsInput } from 'src/diligence-report/dto/create-diligence-report.input'
import { UsersDdsService } from '../users/users-dds.service';
import { Organization } from 'src/users/entities/organization.entity';
@Resolver(() => Shipment)
export class ShipmentResolver {
  constructor(
    private readonly shipmentService: ShipmentService,
    private readonly usersDdsService: UsersDdsService,
  ) {}


  @Query(() => ShipmentListResponse, { name: "getShipmentList" })
  async findAll(@Args(
    'getAllShipmentListInput') input: GetAllShipmentListInput,
    @GetTokenData('userid') userId: number,
    @GetTokenData("organizationid") organizationId: number,
    @GetTokenData("subOrganizationId") subOrganizationId

) {

    let finalSubOrganizationId = subOrganizationId;
    
    if (input.cooperativeId) { // cf suborganization id
      // Find the cooperative in organization table using cf_id
      const cooperative = await Organization.findOne({
        where: { 
          cf_id: input.cooperativeId,
          isSubOrganization: true,
          parent_id: organizationId
        }
      });
      if (cooperative) {
        finalSubOrganizationId = cooperative.id;
      }
    }
    if (input.assignedTo) {
      try {
        const assignedToCfUser = await this.usersDdsService.findByCfID(input.assignedTo);
        if (assignedToCfUser) {
          input.assignedTo = assignedToCfUser.id;
        } else {
          input.assignedTo = -1;
        }
      } catch (error) {
        console.error('Error finding user by CF ID:', error);
        input.assignedTo = -1;
      }
    }
    
    if (input.assignedToIds && input.assignedToIds.length > 0) {
      try {
        const mappedIds = [];
        for (const cfUserId of input.assignedToIds) {
          const assignedToCfUser = await this.usersDdsService.findByCfID(cfUserId);
          if (assignedToCfUser) {
            mappedIds.push(assignedToCfUser.id);
          }
        }
        input.assignedToIds = mappedIds;
      } catch (error) {
        console.error('Error finding users by CF IDs:', error);
        input.assignedToIds = [];
      }
    }
    
    return await this.shipmentService.findAll(input, userId, organizationId, finalSubOrganizationId);
  }


  @Query(() => Shipment, { name: 'shipmentDetail' })
  async findOne(@Args('getShipmentInput', { nullable:true}) getShipmentInput:GetShipmentInput ) {
    return this.shipmentService.findOne(getShipmentInput);
  }


  @Mutation(() => Shipment)
  async createShipment(
    @Args('createShipmentInput') createShipmentInput: CreateShipmentInput,
    @GetTokenData("organizationid") orgId: number,
    @GetTokenData("subOrganizationId") subOrganizationId
  ) {
    return await this.shipmentService.create(createShipmentInput, orgId,subOrganizationId);
  }

  @Mutation(() => Shipment)
  async updateStatus(
    @Args('updateShipment') updateShipment: UpdateShipment,
  ) {
    return await this.shipmentService.updateShipmentStatus(updateShipment);
  }

  @Query(() => DiligenceReportsPaginatedResponse, { name: "diligenceReportsByShipment" })
  async diligenceReportsByShipment(
      @GetTokenData('userid') userId: number,
      @Args('filter', { nullable: true }) filter?: ShipmentDiligenceReportsFilterInput,
  ) {
    return this.shipmentService.diligenceReportByShipment(filter);
  }

  @Mutation(() => BulkOperationResponse)
  async bulkAssignShipments(
    @Args('input') input: BulkAssignShipmentsInput,
  ): Promise<BulkOperationResponse> {
    try {
      const assignedToCfUser = await this.usersDdsService.findByCfID(input.assignedTo);
      return await this.shipmentService.bulkAssignShipments(
        input.shipmentIds,
        assignedToCfUser?.id,
        input.assignedTo,
      );
    } catch (error) {
      throw new Error(`Bulk assign operation failed: ${error.message}`);
    }
  }

  @Mutation(() => BulkApproveBlockchainReportsInput)
  async bulkApproveShipments(
    @Args('input') input: BulkApproveShipmentsInput,
  ): Promise<BulkApproveBlockchainReportsInput> {
    return this.shipmentService.bulkApproveShipments(input);
  }

  @Mutation(() => BulkOperationResponse)
  async bulkRejectShipments(
    @Args('input') input: BulkRejectShipmentsInput,
  ): Promise<BulkOperationResponse> {
    return this.shipmentService.bulkRejectShipments(input);
  }
  
}
