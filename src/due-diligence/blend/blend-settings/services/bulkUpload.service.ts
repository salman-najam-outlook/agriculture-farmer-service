import { Injectable, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { getFileFormat, ACCEPTED_FILETYPES } from '../utils/fileFormatReader';
import { S3Service } from '../utils/s3upload';
import { BlendBulkUploadHistoryService } from './bulkUploadHistory.service';
import { BlendSettingsService } from './blend.service';

@Injectable()
export class BulkUploadService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly blendBulkUploadHistoryService: BlendBulkUploadHistoryService,
    private readonly blendSettingsService: BlendSettingsService
  ) { }
  async processFile(
    file: Express.Multer.File,
    metadata: {organizationId: number; userId: number}
  ): Promise<any> {
    const fileFormat = getFileFormat(file);
    const { organizationId, userId } = metadata;

    console.log("data type", typeof(organizationId))

    // Validate file type
    if (!ACCEPTED_FILETYPES.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only CSV or XLS files are allowed.');
    }
    
    // Parse the file based on its format
    let data = [];
    switch (fileFormat) {
      case 'csv':
      case 'xls':
        data = this.parseCsvOrXlsxData(file.buffer);
        break;
      default:
        throw new BadRequestException('Unsupported file format.');
    }
      
    data = this.removeEmptyObjFromArray(data);
      
    const validationResult = this.validateNonEmptyRecords(data);
      
    // upload the file to the s3
    const fileName = `blend-bulk-upload/${Date.now().toString()}`;
    const uploadedS3Url = await this.s3Service.uploadFile(file, fileName);
      
    const blendBulkUpload = {
        originalFileName: file.originalname,
        s3FileKey: uploadedS3Url.split('.com/')[1],
        location: uploadedS3Url,
        status: validationResult.failedRecords > 0 ? 'FAILED' : 'SUCCESS',
        orgId: organizationId,
        createdBy: userId,
        totalRecordsCount: validationResult.totalRecords,
        failedRecordsCount: validationResult.failedRecords,
      };  
      
    await this.blendBulkUploadHistoryService.create(blendBulkUpload);
      
    if (validationResult.failedRecords === 0) {
      const validRecords = validationResult.data.map(({ status, ...record }) => ({
        ...record,
        orgId: organizationId,
      }));

      await this.blendSettingsService.bulkCreate(validRecords);
    }

    return {
      success: true,
      fileType: fileFormat,
      ...validationResult,
    };
  }

    private parseCsvOrXlsxData(buffer: Buffer): any[] {
        const workbook = XLSX.read(buffer);
        const data = [];
        for (const sheetName of workbook.SheetNames) {
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
            blankrows: false,
            raw: true,
            rawNumbers: true,
        });
        data.push(...sheetData);
        }
        return data;
    }
    
    private removeEmptyObjFromArray(arrayOfObj: any[]): any[] {
        return arrayOfObj.filter((obj) => {
        if (!obj) return false;
        if (!Object.keys(obj).length) return false;
        const isEveryValueEmpty = Object.values(obj).every(
            (value) => value === null || typeof value === 'undefined' || !value.toString().trim().length
        );
        return !isEveryValueEmpty;
        });
    }
    
  private validateNonEmptyRecords(data: any[]): { data: any[]; totalRecords: number; failedRecords: number } {
        const requiredColumns = [
          "Blend Title",
          "Blend Code",
          "Blend Description",
          "Final Product Name",
          "Final Product Code",
        ];
    
        let failedRecords = 0;

        const validatedData = data.map((row) => {
          const messages: string[] = [];

          requiredColumns.forEach((col) => {
            const value = row[col];
            if (value === null || value === undefined || value.toString().trim().length === 0) {
              messages.push(`${col} is missing or empty`);
            }
          });

          if (messages.length > 0) {
            failedRecords++;
            return { ...row, status: 'failed', messages };
          }

          return {
            blendTitle: row["Blend Title"],
            blendCode: row["Blend Code"],
            blendDescription: row["Blend Description"],
            finalProductName: row["Final Product Name"],
            finalProductCode: row["Final Product Code"],
            status: 'success',
          };
        });

        return {
        data: validatedData,
        totalRecords: data.length,
        failedRecords,
        };
    }
}
