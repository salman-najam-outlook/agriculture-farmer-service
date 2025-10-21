import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../mail/mail.service';
import { JobService } from '../job/job.service';
import { Job, JobStatus } from '../job/entities/job.entity';
import { Geofence } from '../geofence/entities/geofence.entity';
import { Farm } from '../farms/entities/farm.entity';
import { UserDDS } from '../users/entities/dds_user.entity';
import { Organization } from '../users/entities/organization.entity';
import axios from 'axios';
import * as ejs from 'ejs';
import { CONSTANT, URL as DEFORESTATION_URL } from '../config/constant';
import { Op, WhereOptions } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import * as path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import * as fs from 'fs';
import * as os from 'os';
import { DueDiligenceProductionPlace } from 'src/due-diligence/production-place/entities/production-place.entity';
import { DiligenceReport } from 'src/diligence-report/entities/diligence-report.entity';
import { Species } from './entities/species.entity';
import { withRetry } from 'src/helpers/api-call.helper';
import { ConfigService } from '@nestjs/config';
import COUNTRIES from 'src/config/country';
import * as moment from 'moment';
import { v4 as uuid } from 'uuid';

interface CFOrganization {
  id: number;
  code: string;
  name: string;
  country?: string | null;
  parentId?: number | null;
}

@Injectable()
export class EmailSchedulerService {
  private readonly logger = new Logger(EmailSchedulerService.name);

  constructor(
    private configService: ConfigService,
    private readonly mailService: MailService,
    private readonly jobService: JobService,
    @InjectModel(Job)
    private readonly JobModel: typeof Job,
    @InjectModel(Geofence)
    private readonly GeofenceModel: typeof Geofence,
    @InjectModel(Farm)
    private readonly FarmModel: typeof Farm,
    @InjectModel(UserDDS)
    private readonly UserDdsModel: typeof UserDDS,
    @InjectModel(Organization)
    private readonly OrganizationModel: typeof Organization,
    @InjectModel(DueDiligenceProductionPlace)
    private readonly DueDiligenceProductionPlaceModel: typeof DueDiligenceProductionPlace,
    @InjectModel(DiligenceReport)
    private readonly DiligenceReportModel: typeof DiligenceReport,
    @InjectModel(Species)
    private readonly SpeciesModel: typeof Species,
  ) {}

  private async getFailedJobsWithExternalIds(): Promise<Job[]> {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    return await this.JobModel.findAll({
      attributes: ['id', 'externalId', 'createdAt'],
      where: {
        externalId: {
          [Op.ne]: null
        },
        createdAt: {
          [Op.gte]: twentyFourHoursAgo
        }
      }
    });
  }

  private async fetchDeforestationData(failedJobs: Job[]): Promise<any[]> {
    const apiCalls = failedJobs.map(async (job) => {
      try {
        const response = await axios.get(`${DEFORESTATION_URL.BASEURL}/detect-deforestation-mass-result`, {
          params: {
            requestId: job.externalId
          },
          headers: {
            'Auth-Token': CONSTANT.DEFORESTATION_API_KEY
          }
        });
        
        if (response.data.success) {
          // Get all AOI IDs from the response
          const aoiIds = response.data.data.map(result => result.aoiId);
          
          // Fetch all related data in a single query
          const geofences = await this.GeofenceModel.findAll({
            where: { id: aoiIds },
            attributes: ['id', 'farmId'],
            include: [
              {
                model: this.FarmModel,
                attributes: ['id', 'farmName', 'userId'],
                include: [
                  {
                    model: this.UserDdsModel,
                    attributes: ['id', 'firstName', 'lastName', 'organization'],
                    include: [
                      {
                        model: this.OrganizationModel,
                        attributes: ['id', 'name']
                      }
                    ]
                  }
                ]
              }
            ]
          });

          // Create a map for quick lookup
          const geofenceMap = new Map(
            geofences.map(geofence => [
              geofence.id,
              {
                farmName: geofence.farmData?.farmName || 'N/A',
                userName: geofence.farmData?.userDdsAssoc 
                  ? `${geofence.farmData.userDdsAssoc.firstName} ${geofence.farmData.userDdsAssoc.lastName}`
                  : 'N/A',
                organizationName: geofence.farmData?.userDdsAssoc?.org.name || 'N/A'
              }
            ])
          );

          // Map the response data with the fetched information
          const enrichedData = response.data.data.filter(result => {

            if(result?.error)  {
              let tmp = JSON.parse(JSON.stringify({
                ...result,
                success: false,
                message: result?.error.includes("Traceback") ? "unknown_error" : result?.error,
                farmName: geofenceMap.get(result.aoiId) ? geofenceMap.get(result.aoiId).farmName : 'N/A',
                userName: geofenceMap.get(result.aoiId) ? geofenceMap.get(result.aoiId).userName : 'N/A',
                organizationName:  geofenceMap.get(result.aoiId) ? geofenceMap.get(result.aoiId).organizationName : 'N/A'

              }))
              return tmp
            } else {
              return false
            }
          
          }).map(item => {
            if(item.error) {
              let tmp = JSON.parse(JSON.stringify({
                ...item,
                success: false,
                message: item?.error.includes("Traceback") ? "unknown_error" : item?.error ,
                farmName: geofenceMap.get(item.aoiId) ? geofenceMap.get(item.aoiId).farmName : 'N/A',
                userName: geofenceMap.get(item.aoiId) ? geofenceMap.get(item.aoiId).userName : 'N/A',
                organizationName:  geofenceMap.get(item.aoiId) ? geofenceMap.get(item.aoiId).organizationName : 'N/A'

              }))
              return tmp
            } else {
              return null
            }
          })

          return {
            jobId: job.id,
            externalId: job.externalId,
            data: enrichedData
          };
        }
        return null;
      } catch (error) {
        this.logger.error(`Error fetching data for job ${job.id}:`, error);
        return null;
      }
    });

    let results = await Promise.all(apiCalls);
    results =  JSON.parse(JSON.stringify(results))
    return results.filter(result => result?.data?.length > 0);
  }

  private async createCsvFile(data: any[], now: number): Promise<Buffer> {
    const csvPath = path.join(os.tmpdir(), `deforestation_failure_report_${now}.csv`);
    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: 'jobId', title: 'Job ID' },
        { id: 'externalId', title: 'External ID' },
        { id: 'aoiId', title: 'AOI ID' },
        { id: 'farmName', title: 'Farm Name' },
        { id: 'userName', title: 'User Name' },
        { id: 'organizationName', title: 'Organization' },
        { id: 'status', title: 'Status' },
        { id: 'message', title: 'Message' },
        { id: 'details', title: 'Details' }
      ]
    });

    // Flatten the data structure for CSV
    const records = data.flatMap(job => 
      job.data.map(result => ({
        jobId: job.jobId,
        externalId: job.externalId,
        aoiId: result.aoiId,
        farmName: result.farmName,
        userName: result.userName,
        organizationName: result?.organizationName,
        status: result.success ? 'Success' : 'Failed',
        message: result.message || 'N/A',
        details: result.result ? JSON.stringify(result.result) : 'No result data'
      }))
    );

    await csvWriter.writeRecords(records);
    const buffer = fs.readFileSync(csvPath);
    // Clean up the temporary file
    fs.unlinkSync(csvPath);
    return buffer;
  }

  private async processSummaryData(deforestationData: any[]): Promise<any[]> {
    // Create a map to store aggregated data by organization and issue
    const summaryMap = new Map();

    deforestationData.forEach(job => {
      job.data.forEach(result => {
        const key = `${result?.organizationName}|||${result.message}`; // Use separator that won't appear in text
        
        if (!summaryMap.has(key)) {
          summaryMap.set(key, {
            client: result?.organizationName,
            issue: result.message,
            farmIds: new Set(), // Use Set to avoid duplicate farm counts
            regions: new Set(), // For future use if region data becomes available
            issueCount: 0 // Track count of farms for this specific issue
          });
        }
        
        const summary = summaryMap.get(key);
        if (result.aoiId !== 'N/A') {
          summary.farmIds.add(result.aoiId);
          summary.issueCount++; // Increment the count for this specific issue
        }
      });
    });

    // Get all unique farm IDs from the summary map
    const allFarmIds = Array.from(new Set(
      Array.from(summaryMap.values())
        .flatMap(summary => Array.from(summary.farmIds))
    ));

    // Fetch all production places for the given farm IDs
    const productionPlaces = await this.DueDiligenceProductionPlaceModel.findAll({
      include: [
        {
          model: this.DiligenceReportModel,
          attributes: ['id', 'countryOfProduction']
        },
        {
          model: this.GeofenceModel,
          attributes: ['id', 'farmId'],
          where: {
            id: allFarmIds
          }
        }
      ]
    });

    // Create a map of farm IDs to their regions
    const farmRegionsMap = new Map();
    productionPlaces.forEach(place => {
      if (place.latestGeofenceId && place.diligenceReports && place.diligenceReports.length > 0) {
        const farmId = place.latestGeofenceId;
        const regions = place.diligenceReports.map(report => report.countryOfProduction);
        farmRegionsMap.set(farmId, regions);
      }
    });

    // Group by client and aggregate issues
    const clientMap = new Map();
    summaryMap.forEach((summary, key) => {
      if (!clientMap.has(summary.client)) {
        clientMap.set(summary.client, {
          client: summary.client,
          issues: [],
          totalFarms: 0
        });
      }
      
      const clientSummary = clientMap.get(summary.client);
      
      // Add regions for this issue's farms
      const issueRegions = new Set();
      Array.from(summary.farmIds).forEach(farmId => {
        const regions = farmRegionsMap.get(farmId);
        if (regions) {
          regions.forEach(region => issueRegions.add(region));
        }
      });

      clientSummary.issues.push({
        issue: summary.issue,
        count: summary.issueCount,
        regions: [...new Set([...issueRegions].flat())]
      });
      clientSummary.totalFarms += summary.issueCount;
    });

    // Convert map to array and format the data
    return Array.from(clientMap.values()).map(clientSummary => ({
      client: clientSummary.client,
      totalFarms: clientSummary.totalFarms,
      issues: clientSummary.issues
    }));
  }

  // Runs every day at 00:01:00 UTC
  // @Cron( '*/5 * * * * *' , {
  @Cron('1 0 * * *', {
    name: 'daily_email_job',
    timeZone: 'UTC'
  })
  async handleDailyEmailJob() {
    try {
      return
      this.logger.log('Starting daily email job...1');

      let today = new Date().toISOString().split('T')[0]
      let todayRes = await this.SpeciesModel.findOne({
        where: {
          name: today
        }
      })
      if(todayRes) {
        this.logger.log('Already sent email for today. Exiting...');
        return
      } else {
        this.logger.log('Starting daily email job...2');
        await this.SpeciesModel.create({
          name: today,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
     

      const failedJobs = await this.getFailedJobsWithExternalIds();
      const now = new Date().getTime();
      
      if (failedJobs.length === 0) {
        this.logger.log('No failed jobs found');
        return;
      }

      const deforestationData = await this.fetchDeforestationData(failedJobs);
      const summaryData = await this.processSummaryData(deforestationData);
      const csvBuffer = await this.createCsvFile(deforestationData, now);

      // Render the EJS template with summary data
      const templatePath = path.join(__dirname, 'views', 'failed_defo_rep_req.ejs');
      const htmlContent = await ejs.renderFile(templatePath, {
        date: new Date().toISOString(),
        filename: `deforestation_failure_report_${now}.csv`,
        summaryData
      });

      // Send email with attachment
      await this.mailService.sendEjsEmailWithAttachment(
        {
          toEmail: ['amit@dimitra.io', 'sandesh@dimitra.io'],
          subject: 'Deforestation Job Failure Report',
          contentParams: {
            htmlContent
          }
        },
        [{
          filename: `deforestation_failure_report_${now}.csv`,
          content: csvBuffer,
          contentType: 'text/csv'
        }]
      );

      this.logger.log('Daily email job completed successfully');
    } catch (error) {
      this.logger.error('Error in daily email job:', error);
    }
  }

  async getOrganizationsFromCF() {
    const response = await withRetry(() => axios.get<{
      organizations: CFOrganization[];
    }>('organizations/real-organizations/list', {
      baseURL: this.configService.get('CF_BASEURL'),
    }), {
      retryTimes: 30,
      retryDelay: 3000,
    });

    return response.data.organizations;
  }

  groupCFOrganizationsByCountry(CFOrganizations: CFOrganization[]) {
    const countryMap: Record<string, CFOrganization[]> = {};

    for(const org of CFOrganizations) {
      let country = org.country;
      if(!country && org.parentId) {
        country = CFOrganizations.find(o => o.id == org.parentId)?.country;
      }

      if(country) {
        country = country.trim();
        const validCountry = COUNTRIES.find(c => {
          if(c.name.toLowerCase() === country.toLowerCase()) return true;
          if(c.code.toLowerCase() === country.toLowerCase()) return true;
          if(c.code3.toLowerCase() === country.toLowerCase()) return true;
          if(c.alternativeNames && c.alternativeNames.map(n => n.toLowerCase()).includes(country.toLowerCase())) return true;
          return false;
        });
        if(!validCountry) {
          this.logger.warn(`Invalid country "${country}" for organization ID ${org.id}. Setting to "Unknown".`);
          country = 'Unknown';
        } else {
          country = validCountry.name;
        }
      }

      if(!country) country = 'Unknown';

      if(!countryMap[country]) {
        countryMap[country] = [];
      }

      countryMap[country].push(org);
    }

    return countryMap;
  }

  async getDDSReportsByCFOrganizations(cfOrganizations: CFOrganization[], whereOptions?: WhereOptions<DiligenceReport>) {
    const organizations = await this.OrganizationModel.findAll({
      where: {
        [Op.or]: [
          { cf_id: { [Op.in]: cfOrganizations.map(org => org.id)} },
          { code: { [Op.in]: cfOrganizations.map(org => org.code) } },
        ],
      }
    });

    if(!organizations.length) return [];

    const organzationIds = organizations.map(org => org.id);

    const diligenceReports = await this.DiligenceReportModel.findAll({
      where: {
        [Op.or]: {
          organizationId: { [Op.in]: organzationIds },
          subOrganizationId: { [Op.in]: organzationIds },
        },
        ...whereOptions,
      },
      attributes: [
        'id',
        'internalReferenceNumber',
        'EUDRReferenceNumber',
        'productNetMass',
        'status',
        'organizationId',
        'subOrganizationId',
        'createdAt'
      ],
      include: [
        {
          association: 'product_detail',
          attributes: ['id', 'name'],
        },
        {
          association: 'sub_product_detail',
          attributes: ['id', 'name'],
        }
      ]
    });

    return diligenceReports;
  }

  async createCSVForDDSMonthlyReport(diligenceReports: DiligenceReport[]): Promise<string> {
    const csvPath = path.join(os.tmpdir(), uuid() + `_dds_monthly_report.csv`);
    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: 'internalReferenceNumber', title: 'Internal Reference Number' },
        { id: 'EUDRReferenceNumber', title: 'EUDR Reference Number' },
        { id: 'productName', title: 'Product' },
        { id: 'subProductName', title: 'Sub Product' },
        { id: 'productNetMass', title: 'Product Net Mass(in kg)' },
        { id: 'status', title: 'Status' },
        { id: 'country', title: 'Organization Country' },
        { id: 'createdAt', title: 'Created At' },
      ]
    });

    // Flatten the data structure for CSV
    const data = diligenceReports.map(report => ({
      internalReferenceNumber: report.internalReferenceNumber || '',
      EUDRReferenceNumber: report.EUDRReferenceNumber || '',
      productName: report.product_detail ? report.product_detail.name : '',
      subProductName: report.sub_product_detail ? report.sub_product_detail.name : '',
      productNetMass: !isNaN(parseFloat(report.productNetMass)) ? Number(parseFloat(report.productNetMass).toFixed(2)) : '',
      status: report.status ? report.status.toUpperCase() : '',
      createdAt: moment(report.createdAt).utc().format('YYYY-MM-DD'),
      country: 'country' in report ? (report as unknown as Record<'country', string>).country : 'Unknown',
    }));

    await csvWriter.writeRecords(data);
    const encoded = fs.readFileSync(csvPath, {
      encoding: 'base64'
    });
    // Clean up the temporary file
    fs.unlinkSync(csvPath);
    return encoded;
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
    name: 'dds_monthly_report_email_job',
    timeZone: 'UTC',
  })
  async handleDdsMonthlyReportEmailJob(testEmail?: string) {
    const isEnabled = this.configService.get('ENABLE_DDS_USAGE_REPORT_EMAIL')?.toString() === 'true';
    const isTesting = testEmail && typeof testEmail === 'string';

    const DDS_USAGE_EMAIL_RECEIVERS: ({
      emails: string[];
      excludedCountries?: string[];
    } & ({ countries?: string[] } | { continents?: string[] }))[] = isTesting ? [
      {
        emails: [testEmail]
      }
    ] : isEnabled ? [
      // Real receivers
      {
        emails: ['kevin@dimitra.io'],
        countries: ['Kenya'],
      },
      {
        emails: ['ricky@dimitra.io'],
        countries: ['Indonesia'],
      },
      {
        emails: ['sherif@dimitra.io', 'jan@dimitra.io'],
        continents: ['Africa', 'Europe'],
        excludedCountries: ['Kenya'],
      },
      {
        emails: ['tushar@dimitra.io'],
        countries: ['India']
      },
      {
        emails: ['carlos@dimitra.io'],
        countries: ['Brazil'],
      },
      {
        emails: ['calvin@dimitra.io'],
        continents: ['South America'],
        excludedCountries: ['Brazil'],
      },
    ] : [];

    const ALL_EMAIL_RECEIVERS = ['jon@dimitra.io', 'andreas@dimitra.io', 'diego@dimitra.io', 'haroon@dimitra.io'];

    try {
      const now = moment.utc();
      const previousMonthStart = now.clone().subtract(1, 'month').startOf('month').toDate();
      const previousMonthEnd = now.clone().subtract(1, 'month').endOf('month').toDate();

      this.logger.log('STARTING DDS MONTHLY REPORT EMAIL JOB');
      const cfOrganizations = await this.getOrganizationsFromCF();
      const cfOrganizationsByCountry = this.groupCFOrganizationsByCountry(cfOrganizations);

      const metricsByCountry: Record<string, {
        diligenceReports: DiligenceReport[],
        totalProductNetMass: number,
      }> = {};
      for(const country of Object.keys(cfOrganizationsByCountry)) {
        const cfOrgs = cfOrganizationsByCountry[country];
        const diligenceReports = await this.getDDSReportsByCFOrganizations(cfOrgs, {
          createdAt: {
            [Op.between]: [previousMonthStart, previousMonthEnd]
          }
        });
        if(!diligenceReports.length) continue;
        metricsByCountry[country] = {
          diligenceReports,
          totalProductNetMass: Number(diligenceReports.reduce((sum, report) => {
            const netMass = parseFloat(report.productNetMass);
            return sum + (isNaN(netMass) ? 0 : netMass);
          }, 0).toFixed(2))
        };
      }

      for(const receiverInfo of DDS_USAGE_EMAIL_RECEIVERS) {
        let countries: string[];
        if('countries' in receiverInfo) {
          countries = receiverInfo.countries;
        } else if('continents' in receiverInfo) {
          countries = COUNTRIES.filter(country => {
            return receiverInfo.continents.map(c => c.toLowerCase()).includes(country.continentName.toLowerCase());
          }).map(c => c.name).filter(c => Object.keys(cfOrganizationsByCountry).includes(c));
        } else {
          countries = Object.keys(cfOrganizationsByCountry);
        }

        if(receiverInfo.excludedCountries) {
          countries = countries.filter(country => !receiverInfo.excludedCountries.includes(country));
        }

        const receiverMetrics: typeof metricsByCountry = {};

        for(const country of Object.keys(metricsByCountry)) {
          if(countries.includes(country)) {
            receiverMetrics[country] = metricsByCountry[country];
          }
        }

        const receiverDiligenceReports = Object.keys(receiverMetrics).reduce((arr, country) => {
          const item = receiverMetrics[country];
          arr.push(...item.diligenceReports.map(report => ({
            ...report.toJSON(),
            country,
          })));
          return arr;
        }, [] as DiligenceReport[]);

        // Render the EJS template with summary data
        const templatePath = path.join(__dirname, 'views', 'dds-metrics-report.ejs');
        const htmlContent = await ejs.renderFile(templatePath, {
          countries,
          month: moment(previousMonthStart).format('MMMM'),
          year: moment(previousMonthStart).format('YYYY'),
          totalReports: receiverDiligenceReports.length,
          totalProductNetMass: Number(receiverDiligenceReports.reduce((sum, report) => {
            const netMass = parseFloat(report.productNetMass);
            return sum + (isNaN(netMass) ? 0 : netMass);
          }, 0).toFixed(2)),
          metricsByCountry: receiverMetrics,
        });

        // Send email with attachment
        await this.mailService.sendEjsEmailWithAttachment(
          {
            toEmail: isTesting ? receiverInfo.emails : [...receiverInfo.emails, ...ALL_EMAIL_RECEIVERS],
            subject: 'DDS Usage Report',
            contentParams: {
              htmlContent
            }
          },
          receiverDiligenceReports.length ? [{
            filename: `dds_usage_report.csv`,
            content: await this.createCSVForDDSMonthlyReport(receiverDiligenceReports),
            contentType: 'text/csv'
          }] : []
        );
      }

      this.logger.log('DDS MONTHLY REPORT EMAIL JOB COMPLETED SUCCESSFULLY');

      return { previousMonthStart, previousMonthEnd, metricsByCountry };
    } catch(error) {
      this.logger.error('FAILED TO SEND MONTHLY DDS REPORT EMAILS', error);
    }
  }
} 