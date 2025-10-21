import { Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { EmailSchedulerService } from './email-scheduler.service';
import { Response } from 'express';



@Controller('api/email-scheduler')
export class EmailSchedulerController {
  constructor(private readonly emailSchedulerService: EmailSchedulerService) {}

  @Post('trigger-deforestation-report')
  async triggerDeforestationReport(
      @Res() res: Response,
  ) {
    await this.emailSchedulerService.handleDailyEmailJob();
    return res.status(200).json({
      status: true,
      statusCode: 200,
      data: { msg: "success" },
    });
  }

  @Get('trigger-dds-monthly-report')
  async triggerDdsMonthlyReport(
    @Res() res: Response,
    @Query('email') email?: string,
  ) {
    const result = await this.emailSchedulerService.handleDdsMonthlyReportEmailJob(email);
    return res.status(200).json({
      status: true,
      statusCode: 200,
      data: { msg: "success", result },
    });
  }
} 