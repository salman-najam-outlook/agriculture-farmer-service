import { Controller, Get, Param, Req, Res } from "@nestjs/common";
import { AssessmentQuestionService } from "./assessment-question.service";
import { Request, Response } from "express";
import { I18n, I18nContext } from 'nestjs-i18n';
const fs = require('fs');

@Controller('api/assessment-builder')
export class AssessmentBuilderController {
  constructor(
    private readonly assessmentQuestionService: AssessmentQuestionService
  ) {}

  @Get('pdf/download/:assessmentId')
  async downloadPdf(
    @Req() req: Request,
    @Param('assessmentId') assessmentId: number,
    @Res() res: Response,
    @I18n() i18n: I18nContext,
  ) {
    const lang = typeof req.headers?.lang === 'string' ? req.headers.lang : "en";
    const pdfBuffer = await this.assessmentQuestionService.generatePdf(assessmentId, i18n.t.bind(i18n), lang);

    if (!pdfBuffer) {
      throw new Error("Assessment PDF generation failed!");
    }

    res.writeHead(200, {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": "attachment; filename=" + pdfBuffer.fileName,
    });
    fs.createReadStream(pdfBuffer.path).pipe(res);
    return;

  }

//   @Get('download-response/:assessmentId')
//   async getQuestions(
//     @Req() req:Request,
//     @Res() res:Response,
//     @I18n() i18n:I18nContext,
//     @Param('assessmentId') assessmentId: number,
//   ){
//     const lang = typeof req.headers?.lang === 'string' ? req.headers.lang : "en";
//     const assessmentSetting = await this.assessmentBuilder.getAssessmentSetting(assessmentId)
//     //const questions = await this.assessmentBuilder.getQuestions(assessmentId, i18n.t.bind(i18n), lang);
//     res.status(200).json({
//       data:{
//         questionType:assessmentSetting.multiStepType,
//         tableData: assessmentSetting.multiStepType == MultiStepAssessmentType.HEADINGS ? await this.assessmentBuilder.getHeadingQuestions(assessmentId,i18n.t.bind(i18n),lang):await this.assessmentBuilder.getQuestions(assessmentId,i18n.t.bind(i18n),lang)
//       }
//     })
//   }
 }