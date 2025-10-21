import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from "@nestjs/apollo";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { join } from "path";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { ConfigModule } from "@nestjs/config";
import { FarmsModule } from "./farms/farms.module";
import { UsersModule } from "./users/users.module";
import { User } from "./users/entities/user.entity";
import { Farm } from "./farms/entities/farm.entity";
import { FarmUploadHistory } from "./farms/entities/farm-upload-history.entity";
import { GeofenceModule } from "./geofence/geofence.module";
import { Geofence } from "./geofence/entities/geofence.entity";
import { PastureMgmtModule } from "./pasture-mgmt/pasture-mgmt.module";
import { HelperModule } from "./helpers/helper.module";
import { RedisModule } from "./redis/redis.module";
import { UserMembership } from "./membership/entities/userMembership.entity";
import { MembershipModule } from "./membership/membership.module";
import { Membership } from "./membership/entities/membership.entity";
import { Addons } from "./membership/entities/add-ons.entity";
import { MembershipFees } from "./membership/entities/membership-fees.entity";
import { UserAddons } from "./membership/entities/user-add-ons-map.entity";
import { PaymentMethods } from "./membership/entities/payment-methods.entity";
import { Payments } from "./membership/entities/payment.entity";
import { GeofenceCoordinates } from "./geofence/entities/geofenceCoordinates.entity";
import { FarmCoordinates } from "./farms/entities/farmCoordinates.entity";
import { Option } from "./farms/entities/options.entity";
import { PastureMgmt } from "./pasture-mgmt/entities/pasture-mgmt.entity";
import { PastureMgmtCoordinates } from "./pasture-mgmt/entities/pasture-mgmt-coordinates.entity";
import { ReportTypes } from "./pasture-mgmt/entities/report-types.entity";
import { SegmentModule } from "./segment/segment.module";
import { ApolloError } from "apollo-server-express";
import { logger } from "./helpers/logger";
import { APP_GUARD } from "@nestjs/core";
import { RolesGuard } from "./core/guard/role.guard";
import { ModulesGuard } from "./core/guard/module.guard";
import { PlansGuard } from "./core/guard/plan.guard";
import { DeforestationModule } from "./deforestation/deforestation.module";
import { DeforestationReportRequest } from "./deforestation/entities/deforestation_report_request.entity";
import { ReportRequestCoordinates } from "./deforestation/entities/request-coordinates.entity";
import { DeforestrationSateliteResponse } from "./deforestation/entities/deforestation_satelite_response.entity";
import { MailModule } from "./mail/mail.module";
import { EnquiryModule } from "./enquiry/enquiry.module";
import { Enquiry } from "./enquiry/entities/enquiry.entity";
import { UserSettingsModule } from "./user-settings/user-settings.module";
import { UserSetting } from "./user-settings/entities/user-setting.entity";
import { RoleModulePermissions } from "./users/entities/role_module_mapping.entity";
import { Modules } from "./users/entities/modules.entity";
import { AcceptLanguageResolver, I18nModule, QueryResolver } from "nestjs-i18n";
import * as path from "path";
import { Organization } from "./users/entities/organization.entity";
import { ProductModule } from "./product/product.module";
import { Product } from "./product/entities/product.entity";
import { SubProduct } from "./product/entities/sub-product.entity";
import { AssesmentModule } from "./assessment/assessment.module";
import { Assesment } from "./assessment/entities/assessment.entity";
import { DiligenceReportModule } from "./diligence-report/diligence-report.module";
import { DiligenceReport } from "./diligence-report/entities/diligence-report.entity";
import { ProductionPlaceModule } from './due-diligence/production-place/production-place.module';
import { ExemptProductsModule } from './due-diligence/blend/exempt-products/exempt-product.module';
import { ExemptProduct } from './due-diligence/blend/exempt-products/entities/exempt-product.entity';


import { DueDiligenceProductionPlace } from "./due-diligence/production-place/entities/production-place.entity";
import { FarmLocation } from "./farms/entities/farmLocation.entity";
import {RiskMitigationFiles} from "./due-diligence/production-place/entities/risk-mitigation-files.entity";
import { AssessmentBuilderModule } from './assessment-builder/assessment-builder.module';
import { ASSESSMENT_MODELS } from "./assessment-builder/constatns/models";
import {DiligenceActivityLog} from "./diligence-report/entities/diligence-activity-log.entity";
import { UsageLimitModule } from './usage-limit/usage-limit.module';
import {MonthlyLimit} from "./usage-limit/entities/report-limit.entity";
import {ReportsType} from "./usage-limit/entities/reports-type.entity";
import {ProductionPlaceDisputes} from "./due-diligence/production-place/entities/production-place-dispute.entity";
import {ProductionPlaceDisputeComments} from "./due-diligence/production-place/entities/dispute-comment.entity";
import { ShipmentModule } from "./shipment/shipment.module"
import { Shipment } from "./shipment/entities/shipment.entity";
import { ShipmentStop } from './shipment/entities/shipment-stop.entity';
import { ShipmentDueDeligenceReport } from './shipment/entities/shipment-duedeligence-report.entity';
import { MessageQueueingModule } from './message-queueing/message-queueing.module';
import { DiligenceReportAssessment } from "./diligence-report/entities/diligence-report-assessment.entity";
import { RequestAdditionalInformation } from "./diligence-report/entities/diligence-report-request-additional-request.entity";
import { EudrSettingsModule } from './eudr-settings/eudr-settings.module';
import { EudrSetting } from "./eudr-settings/entities/eudr-setting.entity";
import { RiskAssessmentLevels } from "./eudr-settings/entities/risk-assessment-levels.entity";
import { DeclarationStatements } from "./eudr-settings/entities/declaration-statements.entity";
import { AssessmentMitigationModule } from './due-diligence/assessment-mitigation/assessment-mitigation.module';
import { ASSESSMENT_MITIGATION_MODELS } from "./due-diligence/assessment-mitigation/constants/models";
import { UserDDS } from "./users/entities/dds_user.entity";
import { JobModule } from './job/job.module';
import GraphQLJSON from 'graphql-type-json';
import { Job } from './job/entities/job.entity';
import { DeforestationAssessmentRiskToleranceLevels } from "./eudr-settings/entities/deforestation-assessment-risk-tolerance-levels.entity";
import { DiligenceReportTransaction } from './diligence-report/entities/diligence-report-transaction.entity';
import { UserMetadata } from "./metadata/entities/user_metadata.entity";
import { MetadataModule } from "./metadata/metadata.module";
import { Translation } from "./translation/translation.entity";
import { TranslationModule } from "./translation/translation.module";
import { ProductsModule } from './due-diligence/blend/manage-products/manage-products.module';
import { DocumentCode } from "./due-diligence/blend/manage-products/entities/document-code.entity";
import { ManageProduct } from "./due-diligence/blend/manage-products/entities/manage-products.entity";
import { ManageSubproduct } from "./due-diligence/blend/manage-products/entities/manage-subproduct.entity";
import { BlendSettingsModule } from "./due-diligence/blend/blend-settings/blend-setting.module";
import { BlendSettingProduct } from "./due-diligence/blend/blend-settings/entities/blend-setting-product.entity";
import { BlendSettings } from "./due-diligence/blend/blend-settings/entities/blend-settings.entity";
import { BlendProductLotIdGenerator } from "./due-diligence/blend/blend-settings/entities/blend-lot-id-configuration.entity";
import { BlendBulkUploadHistory } from "./due-diligence/blend/blend-settings/entities/blend-bulk-upload-history.entity";
import { Blend } from "./due-diligence/blend/blends/entities/blend.entity";
import { BlendProduct } from "./due-diligence/blend/blends/entities/blend-product.entity";
import { BlendModule } from "./due-diligence/blend/blends/blend.module";
import { ContainerDetail } from "./due-diligence/blend/container-details/entities/container-detail.entity";
import { HideDdsReport } from "./due-diligence/blend/blends/entities/hide-dds-report";
import { OfflineSyncModule } from "./offline-sync/offline-sync.module";
import { S3Module } from "./s3/s3.module";
import { DiligenceReportAssessmentResponse } from './diligence-report/entities/diligence-report-assessment-response.entity';
import { DiligenceReportAssessmentSurveys } from './diligence-report/entities/diligence-report-assessment-survey.entity';
import { DiligenceReportAssessmentUpload } from './diligence-report/entities/diligence-report-assessment-upload.entity';
import { ProductionPlaceDeforestationInfo } from './due-diligence/production-place/entities/production-place-deforestation-info.entity';
import { DiligenceReportProductionPlace } from './diligence-report/entities/diligence-report-production-place.entity';
import { DiligenceReportPlaceMitigationFile } from './diligence-report/entities/diligence-report-mitigation-file.entity';
import { ReportPlaceAssessmentProductionPlace } from './diligence-report/entities/diligence-report-place-assessment-production-place.entity';
import { RegionalRiskAssessmentModule } from "./due-diligence/regional-risk-assessment/regional-risk-assessment.module";
import { RiskAssessmentCriteria } from "./due-diligence/regional-risk-assessment/entities/risk-assessment-criteria.entity";
import { RegionalRiskAssessment } from "./due-diligence/regional-risk-assessment/entities/regional-risk-assessment.entity";
import { UpdateUserIdMiddleware } from "./core/middleware/update-user-id.middleware";
import { ClientIPMiddleware } from "./core/middleware/client-ip.middleware";
import { ApiCallHelper } from "./helpers/api-call.helper";
import { DueDiligenceProductionPlacesPyData } from "./deforestation/entities/due_diligence_production_places_py_data.entity";
import { DueDiligenceProductionManuallyMitigated } from "./due-diligence/production-place/entities/due-diligence-production-manually-mitigated.entity";
import { DownloadHistoryModule } from './download-history/download-history.module';
import { PdfDownloadHistory } from "./download-history/entities/pdf-download-history.entity";
import { EmailSchedulerModule } from './email-scheduler/email-scheduler.module';
import { Species } from "./email-scheduler/entities/species.entity";
import { SolanaModule } from './solana/solana.module';
import { SolanaTransaction } from './solana/entities/solana-transaction.entity';
import { DdsReportExporter } from './diligence-report/entities/dds-report-exporter.entity';
import { ApprovalFlowSetting } from "./due-diligence/approval-flow-setting/entities/approval-flow-settings.entity";
import { ApprovalFlowSettingModule } from "./due-diligence/approval-flow-setting/approval-flow-settings.module";

console.log({
  dialect: "mysql",
  host: process.env.HOST || "54.219.140.66",
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USERNAME || "master",
  password: process.env.PASSWORD || "qaWSedRFp;OLikUJ1",
  database: process.env.DATABASE || "dbdimitra_livestock_farmer_falcon",
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    I18nModule.forRoot({
      fallbackLanguage: "en",
      loaderOptions: {
        path: path.join(__dirname, "/i18n/"),
        watch: true,
      },
      viewEngine: "ejs",
      resolvers: [
        { use: QueryResolver, options: ["lang"] },
        AcceptLanguageResolver,
      ],
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      playground: true,
      autoSchemaFile: {federation:2, path:join(process.cwd(), "src/schema.gql")},
      formatError: (error: any) => {
        console.log("------------------");
        logger.error(JSON.stringify(error));
        const errorObj = {
          success: false,
          statusCode: 500,
          message: "Something went wrong",
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            path: [],
            response: {
              message: "Something went wrong",
              detail: "Internal Server Error",
            },
          },
        };

        if (error instanceof ApolloError) {
          errorObj.message = error?.message;
          errorObj.statusCode = error?.extensions?.response?.statusCode || 500;
          errorObj.extensions = {
            code: error.extensions?.code || errorObj.extensions.code,
            path: errorObj.extensions.path,
            response: {
              message:
                error.extensions.response?.message ||
                errorObj.extensions.response.message,
              detail:
                error.extensions.response?.error ||
                errorObj.extensions.response.message,
            },
          };
        } else if (error?.extensions?.exception?.name == "HttpException") {
          errorObj.message = error?.message;
          errorObj.statusCode =
            error.extensions.exception?.status || errorObj.statusCode;
          errorObj.extensions = {
            code: error.extensions?.code || errorObj.extensions.code,
            path: error?.path || errorObj.extensions.path,
            response: {
              message:
                error.extensions.exception?.message ||
                errorObj.extensions.response.message,
              detail: errorObj.extensions.response.message,
            },
          };
        } else {
          errorObj.message = error?.message || errorObj.statusCode;
          errorObj.statusCode =
            error.extensions.exception?.status || errorObj.statusCode;
          errorObj.extensions = {
            code: error.extensions?.code || errorObj.extensions.code,
            path: error?.path || errorObj.extensions.path,
            response: {
              message: error?.message || errorObj.extensions.response.message,
              detail:
                error?.extenstions?.exception?.details ||
                errorObj.extensions.response.message,
            },
          };
        }

        return errorObj;
      },
      resolvers: { JSON: GraphQLJSON },
    }),
    SequelizeModule.forRoot({
      dialect: "mysql",
      host: process.env.HOST || "54.219.140.66",
      port: +process.env.DB_PORT || 3306,
      pool: {
        max: 100,
        min: 0,
        acquire: 60000,
      },
      logging:false,
      dialectOptions: {
        connectTimeout: 60000, // 60 seconds
      },
      logQueryParameters: true,
      username: process.env.DB_USERNAME || "master",
      password: process.env.PASSWORD || "qaWSedRFp;OLikUJ1",
      database: process.env.DATABASE || "dbdimitra_livestock_farmer_falcon",
      models: [
        User,
        UserDDS,
        Farm,
        Geofence,
        Membership,
        UserMembership,
        Addons,
        MembershipFees,
        UserAddons,
        PaymentMethods,
        Payments,
        Option,
        FarmCoordinates,
        GeofenceCoordinates,
        PastureMgmt,
        PastureMgmtCoordinates,
        ReportTypes,
        DeforestationReportRequest,
        ReportRequestCoordinates,
        DeforestrationSateliteResponse,
        Enquiry,
        UserSetting,
        RoleModulePermissions,
        Modules,
        Organization,
        Product,
        SubProduct,
        Assesment,
        Shipment,
        ShipmentStop,
        ShipmentDueDeligenceReport,
        DiligenceReport,
        DueDiligenceProductionPlace,
        FarmLocation,
        RiskMitigationFiles,
        DiligenceActivityLog,
        MonthlyLimit,
        ReportsType,
        ProductionPlaceDisputes,
        ProductionPlaceDisputeComments,
        DiligenceReportAssessment,
        FarmUploadHistory,
        RequestAdditionalInformation,
        EudrSetting,
        RiskAssessmentLevels,
        DeclarationStatements,
        ...ASSESSMENT_MODELS,
        ...ASSESSMENT_MITIGATION_MODELS,
        Job,
        DeforestationAssessmentRiskToleranceLevels,
        DiligenceReportTransaction,
        UserMetadata,
        Translation,
        DocumentCode,
        ManageSubproduct,
        ExemptProduct,
        ContainerDetail,
        ManageProduct,
        BlendSettingProduct,
        BlendSettings,
        BlendProductLotIdGenerator,
        BlendBulkUploadHistory,
        Blend,
        BlendProduct,
        HideDdsReport,
        DiligenceReportAssessmentResponse,
        DiligenceReportAssessmentSurveys,
        DiligenceReportAssessmentUpload,
        ProductionPlaceDeforestationInfo,
        DiligenceReportProductionPlace,
        DiligenceReportPlaceMitigationFile,
        ReportPlaceAssessmentProductionPlace,
        RiskAssessmentCriteria,
        RegionalRiskAssessment,
        DueDiligenceProductionPlacesPyData,
        DueDiligenceProductionManuallyMitigated,
        PdfDownloadHistory,
        Species,
        SolanaTransaction,
        DdsReportExporter,
        ApprovalFlowSetting
      ],
    }),
    FarmsModule,
    UsersModule,
    GeofenceModule,
    PastureMgmtModule,
    HelperModule,
    RedisModule,
    MembershipModule,
    SegmentModule,
    DeforestationModule,
    MailModule,
    EnquiryModule,
    UserSettingsModule,
    ProductModule,
    AssesmentModule,
    DiligenceReportModule,
    ProductionPlaceModule,
    AssessmentBuilderModule,
    UsageLimitModule,
    ShipmentModule,
    MessageQueueingModule,
    EudrSettingsModule,
    AssessmentMitigationModule,
    JobModule,
    MetadataModule,
    TranslationModule,
    OfflineSyncModule,
    S3Module,
    ProductsModule,
    ExemptProductsModule,
    BlendSettingsModule,
    BlendModule,
    RegionalRiskAssessmentModule,
    DownloadHistoryModule,
    EmailSchedulerModule,
    SolanaModule,
    ApprovalFlowSettingModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ApiCallHelper,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ModulesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PlansGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UpdateUserIdMiddleware).forRoutes("*");
    consumer.apply(ClientIPMiddleware).forRoutes("*");
  }
}
