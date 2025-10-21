import { PastureMgmtService } from './pasture-mgmt.service';
import { UpdatePastureReport } from './dto/update-pasture-mgmt.input';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';
import { PastureReportRequest } from './dto/create-pasture-mgmt.input';
import { MailService } from 'src/mail/mail.service';
import { emailParams } from 'src/mail/mail.interface';

@Controller('pasture-mgmt/report')
export class PasterManagementController {
  constructor(
    private readonly pastureService: PastureMgmtService,
    private readonly mailService: MailService,
  ) {}

  @Get('email')
  async testEmail() {
    const params: emailParams = {
      toEmail: 'rajiv@dimitra.io',
      subject: 'Enquiry ',
      contentParams: {
        fullName: 'Rajiv Phanju',
        email: 'rajiv@dimitra.io',
        subject: 'Deforestation',
        areaOfInterest: 'LG',
        type: 'Incident',
        status: 'open',
        date: '2023-01-04',
        description: `lorem ipsum dolor sit amet lorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum 
        dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit amet `,
        attachmentLink:
          'https://livestock-be-s3-dev.s3.us-west-1.amazonaws.com/image_2022_2023-01-02T16%3A02%3A54.867231Z.png',
      },
    };
    return await this.mailService.sendEmail('Enquiry', params);
  }

  @Get(':id')
  async get(@Param('id') id: number) {
    return await this.pastureService.findOne(id);
  }

  @Get()
  async getAll(@Query() params: PastureReportRequest) {
    return await this.pastureService.findAll(
      params.page,
      params.size,
      null,
      null,
      null,
      params.userId,
      params.status,
      params.createdAt,
      params.dateOfInterest,
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updatePastureReport: UpdatePastureReport,
  ) {
    return await this.pastureService.update(id, updatePastureReport);
  }
}
