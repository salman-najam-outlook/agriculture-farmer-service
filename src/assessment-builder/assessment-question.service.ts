import { Inject, Injectable, Logger } from "@nestjs/common";
import { CreateAssessmentInput } from "./dto/create-assessment-builder.input";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { Op, QueryTypes } from "sequelize";
import { AssessmentBuilderService } from "./assessment-builder.service";
import { AssessmentQuestions } from "./entities/assessment-questions.entity";
import {
  CreateAssessmentQuestionInput,
  CreateAssessmentQuestionOutput,
  GetAllQuestionListInput,
} from "./dto/create-assessment-question.input";
import { AssessmentQuestionOptions } from "./entities/assessment-question-options.entity";
import { AssessmentOptionsAndSubQuestionsMapping } from "./entities/assessments-options-and-sub-questions-mapping.entity";
import { AssessmentQuestionOptionsInput } from "./dto/create-assessment-option.input";
import { AssessmentQuestionType } from "./dto/AssessmentQuestionType";
import { MultiStepAssessmentType } from "./dto/MultiStepAssessmentType";
import { AssessmentQuestionHeading } from "./entities/assessment-question-headings.entity";
import { AssessmentSetting } from "./entities/assessment-setting.entity";
const path = require('path');
import * as ejs from "ejs";
import * as fs from "fs";
import * as html_to_pdf from 'html-pdf-node';
import * as moment from "moment";

@Injectable()
export class AssessmentQuestionService {
  constructor(
    @Inject("SEQUELIZE")
    private readonly sequelize: Sequelize,

    @InjectModel(AssessmentSetting)
    private readonly assessmentSettingModel: typeof AssessmentSetting,

    @InjectModel(AssessmentQuestions)
    private readonly assessmentQuestionModel: typeof AssessmentQuestions,

    @InjectModel(AssessmentQuestionHeading)
    private readonly assessmentQuestionHeading: typeof AssessmentQuestionHeading,

    @InjectModel(AssessmentQuestionOptions)
    private readonly assessmentQuestionOptionsModel: typeof AssessmentQuestionOptions,

    @InjectModel(AssessmentOptionsAndSubQuestionsMapping)
    private readonly optionAndQuestionMappingModel: typeof AssessmentOptionsAndSubQuestionsMapping,

    private readonly assessmentService: AssessmentBuilderService
  ) { }
  async create(createAssessmentQuestionInput: CreateAssessmentQuestionInput) {
    try {
      const { assessmentId, headingId } = createAssessmentQuestionInput;
      const assessmentDetail = await this.assessmentService.findOne(
        assessmentId
      );
      const assessmentSetting = assessmentDetail.assessmentSettings;

      if (
        assessmentSetting.multiStepType === MultiStepAssessmentType.HEADINGS &&
        !headingId
      ) {
        throw new Error(`Heading is required for Heading type assessment.`);
      }

      if (
        assessmentSetting.multiStepType === MultiStepAssessmentType.QUESTIONS &&
        headingId
      ) {
        createAssessmentQuestionInput.headingId = null;
      }

      const orderOfQuestion = createAssessmentQuestionInput.order ||
        (await this.getLastOrderOfQuestion(
          assessmentSetting.multiStepType,
          assessmentId,
          headingId
        )) + 1;

      createAssessmentQuestionInput.order = orderOfQuestion;

      const question = await this.saveQuestions(
        0,
        createAssessmentQuestionInput
      );

      await this.increaseAssessmentQuestionCount(
        createAssessmentQuestionInput.assessmentId,
        1
      );
      if(createAssessmentQuestionInput.hasOptions && createAssessmentQuestionInput.options?.length){
        await this.increaseAssessmentResponseCount(
          createAssessmentQuestionInput.assessmentId,
          createAssessmentQuestionInput.options.length
        );
      }
      return question;
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  }

  async getLastOrderOfQuestion(
    multiStepType: MultiStepAssessmentType,
    assessmentId: number,
    headingId: number
  ) {
    if (multiStepType === MultiStepAssessmentType.HEADINGS) {
      return this.getCountOfAssessmentTypeHeading(assessmentId, headingId);
    }
    return this.getCountOfAssessmentTypeQuestion(assessmentId);
  }

  async getCountOfAssessmentTypeQuestion(assessmentId: number) {
    return await this.assessmentQuestionModel.count({
      where: { assessmentId, headingId: null },
    });
  }

  async getCountOfAssessmentTypeHeading(
    assessmentId: number,
    headingId: number
  ) {
    return await this.assessmentQuestionModel.count({
      where: { assessmentId, headingId },
    });
  }

  async saveQuestions(
    level: number,
    createAssessmentQuestionInput: CreateAssessmentQuestionInput,
    parentQuestionId?: number
  ) {
    //1 level of nested is supported by fetch query so restricting it.
    if (level === 2) return;
    const { options, ...questionPayload } = createAssessmentQuestionInput;
    if (
      questionPayload.assessmentQuestionType ===
      AssessmentQuestionType.FILE_ATTACHMENT
    ) {
      questionPayload.isFileType = true;
      questionPayload.isDigitalSignatureType = false;
      questionPayload.hasOptions = false;
    } else {
      questionPayload.isFileType = false;
    }
    if (
      questionPayload.assessmentQuestionType ===
      AssessmentQuestionType.DIGITAL_SIGNATURE
    ) {
      questionPayload.isDigitalSignatureType = true;
      questionPayload.isFileType = false;
      questionPayload.hasOptions = false;
    } else {
      questionPayload.isDigitalSignatureType = false;
    }
    const question = await this.assessmentQuestionModel.create({
      ...questionPayload,
      parentQuestionId,
    });

    if (questionPayload.hasOptions && options?.length) {
      await this.saveOptions(level, options, question.id);
    }
    return question;
  }

  async saveOptions(
    level: number,
    createOptionsInputs: AssessmentQuestionOptionsInput[],
    assessmentQuestionId: number
  ) {
    for (const optionInput of createOptionsInputs) {
      const { subQuestions, ...optionPayload } = optionInput;
      const option = await this.assessmentQuestionOptionsModel.create({
        ...optionPayload,
        assessmentQuestionId,
      });
      if (subQuestions?.length) {
        const questionIds = [];
        for (const subQuestion of subQuestions) {
          const question = await this.saveQuestions(
            level + 1,
            subQuestion,
            assessmentQuestionId
          );
          questionIds.push(question.id);
        }
        const mappingPayload = questionIds.map((qId) => {
          return {
            parentQuestionId: assessmentQuestionId,
            optionId: option.id,
            subQuestionId: qId,
          };
        });
        await this.optionAndQuestionMappingModel.bulkCreate(mappingPayload);
      }
    }
  }
  
  async findAllQuestionsOfAssessment(
    getAllQuestionListInput: GetAllQuestionListInput
  ) {
    let {
      page = 1,
      limit = 10,
      assessmentId,
      search,
    } = getAllQuestionListInput;
    const query = { offset: 0, limit: 10 };
    if (page && limit) {
      limit = limit;
      query.offset = (page - 1) * limit;
      query.limit = limit;
    }

    let where: any = {
      assessmentId,
      parentQuestionId: null,
      headingId: null,
    };

    if (search) {
      where = {
        ...where,
        [Op.or]: [
          {
            title: { [Op.like]: `%${search}%` },
          },
        ],
      };
    }

    let res: { totalCount: number, count: number; rows: any };

    res = {
      totalCount: await this.assessmentQuestionModel.count({
        where: { assessmentId }
      }),
      ...await this.assessmentQuestionModel.findAndCountAll({
        where,
        include: [
          {
            model: AssessmentQuestionOptions,
            as: "options"
          }
        ],
        order: [["order", "ASC"]],
      })
    };

    return res;
  }

  async findAllQuestionsOfAssessmentByHeading(
    getAllQuestionListInput: GetAllQuestionListInput
  ) {
    let {
      page = 1,
      limit = 10,
      assessmentId,
      search,
    } = getAllQuestionListInput;
    const query = { offset: 0, limit: 10 };
    if (page && limit) {
      limit = limit;
      query.offset = (page - 1) * limit;
      query.limit = limit;
    }

    let where: any = {
      assessmentId,
    };

    if (search) {
      where = {
        ...where,
        [Op.or]: [
          {
            title: { [Op.like]: `%${search}%` },
          },
        ],
      };
    }

    return this.assessmentQuestionsOfHeading(assessmentId, where, query);
  }


  async findAllQuestionsOfAssessmentByHeadingId(
    assessmentId: number,
    headingId: number
  ) {

    const query = { offset: 0, limit: 1 };

    let where: any = {
      id: headingId,
    };

    return this.assessmentQuestionsOfHeading(assessmentId, where, query);
  }

  async getBasicQuestionDetail (questionId: number){
    return await this.assessmentQuestionModel.findOne({
      where:{
        id: questionId
      }
    })
  }

  async findQuestionsDetail(assessmentId: number, questionId?: number) {
    const where: any = {
      parentQuestionId: null,
      assessmentId,
    };

    if (questionId) {
      where.id = questionId;
    }
    const data = await this.assessmentQuestionModel.findAll({
      where,
      include: [
        {
          model: AssessmentQuestionOptions,
          as: "options",
          required: false,
          include: [
            {
              model: AssessmentQuestions,
              as: "subQuestions",
              required: false,
              include: [
                {
                  model: AssessmentQuestionOptions,
                  as: "options",
                  required: false,
                },
              ],
            },
          ],
        },
      ],
      order:[['order','asc']]
    });
    return data;
  }

  async assessmentQuestionsOfHeading(
    assessmentId: number,
    where = {},
    paginationQuery = {}
  ) {
    let res: { totalCount?: any; count: any; rows: any };
    res = await this.assessmentQuestionHeading.findAndCountAll({
      include: [
        {
          where: {
            assessmentId,
            parentQuestionId: null,
          },
          model: AssessmentQuestions,
          as: "assessmentQuestions",
          required: false,
          include: [
            {
              model: AssessmentQuestionOptions,
              as: "options",
              required: false,
              include: [
                {
                  model: AssessmentQuestions,
                  as: "subQuestions",
                  required: false,
                  include: [
                    {
                      model: AssessmentQuestionOptions,
                      as: "options",
                      required: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      where,
      ...paginationQuery,
      // subQuery: false,
      order: [["order", "ASC"],[{       model: AssessmentQuestions,
        as: "assessmentQuestions",},"order", "ASC"]], // Ordering the main query results
    });
    res.totalCount = res.count;
    res.count = res.rows.length;

    // Manually sorting when ordering is not working
    res.rows.forEach(question => {
      if (question.assessmentQuestions) {
          question.assessmentQuestions.sort((a, b) => a.order - b.order);
      }
  });

    return res;
  }

  async findQuestionForAssessment(assessmentId: number) {
    const assessmentDetail = await this.assessmentService.findOne(assessmentId);
    const { assessmentSettings } = assessmentDetail;
    if (
      assessmentSettings?.multiStepType === MultiStepAssessmentType.HEADINGS
    ) {
      return this.assessmentQuestionsOfHeading(assessmentId, { assessmentId });
    }
    const questionCountPerStep = assessmentSettings?.noOfQuestion || 0;

    const questions = await this.findQuestionsDetail(assessmentId);
    const res: { totalCount?: any; count: any; rows: any } = {
      totalCount: 0,
      count: 0,
      rows: [],
    };

    if (questionCountPerStep > 0 && questions.length > 0) {
      const questionsWithStep = [];
  
      for (let i = 0; i < questions.length; i += questionCountPerStep) {
        questionsWithStep.push({
          title: `Step ${questionsWithStep.length + 1}`,
          assessmentQuestions: questions.slice(i, i + questionCountPerStep),
        });
      }
  
      res.totalCount = questionsWithStep.length;
      res.count = questionsWithStep.length;
      res.rows = questionsWithStep;
    } else {
      res.totalCount = 1;
      res.count = 1;
      res.rows = [
        {
          title: 'All Questions',
          assessmentQuestions: questions,
        },
      ];
    }
    return res;
  }

  // private assessmentQuestionQueryBuilder(
  //   assessmentId: number,
  //   isActiveOnly: boolean,
  //   questionId?: number
  // ) {
  //   let whereQuery = `AND 1=1`;

  //   const params: any = { assessmentId };

  //   if (questionId) {
  //     whereQuery += ` AND AQ.id = :questionId`;
  //     params.questionId = questionId;
  //   }

  //   if (isActiveOnly) {
  //     whereQuery += ` AND AQ.is_enabled = true`;
  //   }

  //   const query = `with Questions as (
  //     SELECT
  //       AQ.id,
  //       AQ.user_id as "userId",
  //       AQ.assessment_id as "assessmentId",
  //       AQ.parent_question_id as "parentQuestionId",
  //       AQ.title,
  //       AQ.assessment_question_type as "assessmentQuestionType",
  //       AQ.is_mandatory as "isMandatory",
  //       AQ.is_enabled as "isEnabled",
  //       AQ.is_file_type as "isFileType",
  //       AQ.file_type_additional_settings as "fileTypeAdditionalSettings",
  //       AQ.is_digital_signature_type as "isDigitalSignatureType",
  //       AQ.digital_signature_type_additional_settings as "digitalSignatureTypeAdditionalSettings",
  //       AQ.has_options as "hasOptions",
  //       AQ.createdAt,
  //       AQ.updatedAt
  //     FROM
  //       cf_dev_deforestation.assessment_questions AQ
  //     WHERE
  //       AQ.assessment_id = :assessmentId
  //       AND
  //             AQ.parent_question_id IS NULL ${whereQuery} ),
  //     Options as (
  //     select
  //       AGO.id as "optionId",
  //       AGO.assessment_question_id as "assessmentQuestionId",
  //       AGO.label as "label",
  //       AGO.value as "value",
  //       AGO.checklists as "checklists",
  //       SQ_MAP.parent_question_id as "parentQuestionId",
  //       SQ_MAP.sub_question_id as "subQuestionId"
  //     from
  //       cf_dev_deforestation.assessment_questions AQ
  //     inner join
  //     cf_dev_deforestation.assessment_question_options AGO ON
  //       AQ.id = AGO.assessment_question_id
  //       AND AQ.assessment_id = :assessmentId ${whereQuery}
  //     LEFT JOIN cf_dev_deforestation.assessment_options_and_sub_questions_mappings SQ_MAP ON
  //       SQ_MAP.option_id = AGO.id
  //     ),
  //     OptionsWithQuestions as (
  //     select
  //       O.optionId,
  //       O.assessmentQuestionId,
  //       O.label,
  //       O.value,
  //       O.checklists,
  //       IF(COUNT(AQS.id) = 0,
  //       JSON_ARRAY(),
  //       JSON_ARRAYAGG(JSON_OBJECT (
  //     'id', AQS.id,
  //      'userId', AQS.user_id,
  //       'assessmentId', AQS.assessment_id,
  //        'parentQuestionId', AQS.parent_question_id,
  //        'title', AQS.title,
  //         'assessmentQuestionType', AQS.assessment_question_type,
  //          'isMandatory', AQS.is_mandatory,
  //          'isEnabled', AQS.is_enabled,
  //        'isFileType', AQS.is_file_type,
  //          'fileTypeAdditionalSettings', AQS.file_type_additional_settings,
  //          'isDigitalSignatureType', AQS.is_digital_signature_type,
  //         'digitalSignatureTypeAdditionalSettings', AQS.digital_signature_type_additional_settings,
  //         'hasOptions', AQS.has_options
  //             ) )) as "subQuestions"
  //     from
  //       Options O
  //     left join cf_dev_deforestation.assessment_questions AQS ON
  //       O.subQuestionId = AQS.id
  //     GROUP BY
  //       O.optionId
  //     )
  //     select
  //       Q.*,
  //       IF(COUNT(OQ.optionId) = 0,
  //       JSON_ARRAY(),
  //       JSON_ARRAYAGG(JSON_OBJECT(
  //     'optionId', OQ.optionId,
  //     'label', OQ.label,
  //     'value', OQ.value,
  //     'checklists', OQ.checklists,
  //     'subQuestions', OQ.subQuestions
  //     )) ) as options
  //     from
  //       Questions Q
  //     INNER JOIN
  //     OptionsWithQuestions OQ ON
  //       Q.id = OQ.assessmentQuestionID
  //     GROUP BY
  //       Q.id;`;

  //   return { query, params };
  // }

  // async findQuestionForAssessment(
  //   assessmentId: number
  // ): Promise<CreateAssessmentQuestionOutput[]> {
  //   const { query, params } = this.assessmentQuestionQueryBuilder(
  //     assessmentId,
  //     true
  //   );

  //   const queryResponse: Array<CreateAssessmentQuestionOutput> =
  //     await this.sequelize.query(query, {
  //       replacements: params,
  //       type: QueryTypes.SELECT,
  //     });

  //   return queryResponse;
  // }

  // async findQuestionDetail(
  //   assessmentId: number,
  //   questionId: number
  // ): Promise<CreateAssessmentQuestionOutput> {
  //   const { query, params } = this.assessmentQuestionQueryBuilder(
  //     assessmentId,
  //     false,
  //     questionId
  //   );
  //   const queryResponse: CreateAssessmentQuestionOutput =
  //     await this.sequelize.query(query, {
  //       replacements: params,
  //       type: QueryTypes.SELECT,
  //       plain: true,
  //     });

  //   return queryResponse;
  // }

  async updateOrder(id: number, order: number) {
    await this.assessmentQuestionModel.update(
      {
        order,
      },
      { where: { id } }
    );
  }

  async getParentQuestion(assessmentId: number, headingId?: number) {
    const where: any = {
      assessmentId,
      parentQuestionId: null,
    };
    if (headingId) {
      where.headingId = headingId;
    }
    return await this.assessmentQuestionModel.findAll({
      attributes: ["id"],
      where,
      order: [["order", "ASC"]],
    });
  }

  async remove(id: number, reorder: boolean) {
    const questionDetail = await this.assessmentQuestionModel.findOne({
      attributes: ["id", "assessmentId", "headingId"],
      where: {
        id: id,
      },
    });

    await this.assessmentQuestionModel.destroy({ where: { id } });
    if(reorder){
      const questions = await this.getParentQuestion(
        questionDetail.assessmentId,
        questionDetail.headingId
      );
  
      for (const [i, element] of questions.entries()) {
        if (element) {
          await this.updateOrder(element.id, i + 1);
        }
      }
    }


    return true;
  }

  async increaseAssessmentQuestionCount(
    assessmentId: number,
    increment: number
  ) {
    return await this.assessmentService.increaseAssessmentQuestionCount(
      assessmentId,
      increment
    );
  }

  async increaseAssessmentResponseCount(
    assessmentId: number,
    increment: number
  ) {
    return await this.assessmentService.increaseAssessmentResponseCount(
      assessmentId,
      increment
    );
  }

  async reorderQuestion(
    assessmentId: number,
    questionId: number,
    newOrder: number
  ) {
    const assessmentQuestionDetail = await this.assessmentQuestionModel.findOne(
      {
        where: {
          id: questionId,
          assessmentId,
          parentQuestionId: null,
        },
      }
    );

    if (!assessmentQuestionDetail) {
      throw new Error("Question not found.");
    }

    const wherePayload = {
      assessmentId,
      headingId: null,
      parentQuestionId: null,
    };
    if (assessmentQuestionDetail.headingId) {
      wherePayload.headingId = assessmentQuestionDetail.headingId;
    }

    const questions = await this.assessmentQuestionModel.findAll({
      attributes: ["id", "order"],
      where: wherePayload,
      order: [["order", "ASC"]],
    });

    // Find the item
    const itemIndex = questions.findIndex((item) => item.id === questionId);
    if (itemIndex === -1) {
      throw new Error("Question not found.");
    }

    // Remove the item from the list
    const [item] = questions.splice(itemIndex, 1);

    // Insert the item at the new index
    questions.splice(newOrder - 1, 0, item);

    for (const [i, element] of questions.entries()) {
      if (element) {
        await this.updateOrder(element.id, i + 1);
      }
    }

    return true;
  }

  async getAssessmentSetting(assessment_id){
    const assessmentSetting = await this.assessmentSettingModel.findOne({
      where:{
        assessmentId:assessment_id
      }
    })
    return assessmentSetting
  }

  async getHeadingQuestions (assessment_id:number, translationFn:Function, lang='en'){

    const questions = await this.assessmentQuestionHeading.findAndCountAll({
      include: [
        {
          model:AssessmentQuestions,
          as:'assessmentQuestions',
          required:true,
          include:[
            {
              model: AssessmentQuestionOptions,
              as: "options",
              required: false,
              include: [
                {
                  model: AssessmentQuestions,
                  as: "subQuestions",
                  required: false,
                  order:[['order','asc']],
                  include: [
                    {
                      model: AssessmentQuestionOptions,
                      as: "options",
                      required: false,
                    },
                  ],
                },
              ],
            },
          ]
        }
      ],
      where: {
        assessment_id: assessment_id,
      },
      order: [["order", "ASC"]],
    })
    return questions.rows
  }

  async getQuestions (assessment_id:number, translationFn:Function, lang='en'){

    const questions = await this.assessmentQuestionModel.findAndCountAll({
      include: [
        {
          model: AssessmentQuestionOptions,
          as: "options",
          required: false,
          include: [
            {
              model: AssessmentQuestions,
              as: "subQuestions",
              required: false,
              order:[['order','asc']],
              include: [
                {
                  model: AssessmentQuestionOptions,
                  as: "options",
                  required: false,
                },
              ],
            },
          ],
        },
      ],
      where: {
        assessment_id: assessment_id,
      },
      order: [["order", "ASC"]],
    })
    
    return questions.rows
  }

  async generatePdf(assessmentId: number, translationFn: Function, lang = 'en') {
    const assessmentDetail = await this.assessmentService.findOne(
      assessmentId
    );

    const assessmentSetting = await this.assessmentSettingModel.findOne({
      where:{
        assessmentId
      }
    })
    const questionCount = await this.assessmentQuestionModel.count({
      where: {
        assessment_id: assessmentId,
        // assessmentQuestionType: {
        //   [Op.notIn]: ["FILE_ATTACHMENT", "DIGITAL_SIGNATURE"], // Exclude specific question types while counting
        // },
      },
    });
    
    const data = {
      title: "Risk Assessment",
      subHeader: {
        dateCreated: moment(assessmentDetail.createdAt).format('DD/MM/YYYY'),
        questions: questionCount,
      },
      questionType:assessmentSetting.multiStepType,
      tableData: assessmentSetting.multiStepType == MultiStepAssessmentType.HEADINGS ? await this.getHeadingQuestions(assessmentId,translationFn,lang):await this.getQuestions(assessmentId,translationFn,lang)
    }
    const template = fs.readFileSync(path.resolve(__dirname, "../../../src/assessment-builder/view/assessment-builder-pdf.html"), "utf8");
    let html = await ejs.render(template, {
      data,
      lang,
      t: translationFn,
    });
    let fileName = data.title + ' - '
      + Date.now() + '.pdf'
    fileName = fileName.replace(/\s+/g, '').substring(fileName.length-40, fileName.length);
    const fileDestinationDir = path.resolve(__dirname, `../../../src/assessment-builder/reports`);
    const fileDestination = path.join(fileDestinationDir, fileName);
    fs.mkdirSync(fileDestinationDir, { recursive: true });

    const footerTemplate = `<div style="width: 100%; background: white; padding: 0px 20px; display: flex; justify-content: space-between; font-size: 10px; color: #333;">
      <div>www.dimitra.io</div>
      <div>${translationFn('message.page', { lang })} <span class="pageNumber"></span> ${translationFn('message.of', { lang })} <span class="totalPages"></span></div>
      </div>`
    const options = {
      scale: 0.7,
      displayHeaderFooter: true,
      format: 'A4',
      footerTemplate,
      path: fileDestination,
      printBackground: true,
      margin: {
        bottom: '30mm'
      }
    }
    let file = { content: html };
    let pdf = await html_to_pdf.generatePdf(file, options)
    // if (pdf) {
      return {
        fileName,
        path: fileDestination
      }
    // }
  }
}
