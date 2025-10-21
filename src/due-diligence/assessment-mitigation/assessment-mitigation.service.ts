import { Inject, Injectable } from "@nestjs/common";
import {
  CreateAssessmentMitigationDiscussionInput,
  CreateAssessmentMitigationInput,
} from "./dto/create-assessment-mitigation.input";
import { UpdateAssessmentMitigationInput } from "./dto/update-assessment-mitigation.input";
import { Sequelize } from "sequelize-typescript";
import { InjectModel } from "@nestjs/sequelize";
import { AssessmentMitigation } from "./entities/assessment-mitigation.entity";
import { AssessmentMitigationChecklists } from "./entities/assessment-mitigation_checklists.entity";
import { AssessmentMitigationAttachments } from "./entities/assessment-mitigation_attachments.entity";
import { AssessmentMitigationDiscussions } from "./entities/assessment-mitigation_discussions.entity";
import { DueDiligenceProductionPlace } from "../production-place/entities/production-place.entity";
import { Farm } from "src/farms/entities/farm.entity";
import { AssessmentQuestionOptions } from "src/assessment-builder/entities/assessment-question-options.entity";
import { AssessmentQuestions } from "src/assessment-builder/entities/assessment-questions.entity";
import { Assessment } from "src/assessment-builder/entities/assessment.entity";
import { UserDDS as User } from "src/users/entities/dds_user.entity";
import { AssessmentQuestionHeading } from "src/assessment-builder/entities/assessment-question-headings.entity";
import { DiligenceReportProductionPlace } from 'src/diligence-report/entities/diligence-report-production-place.entity';
@Injectable()
export class AssessmentMitigationService {
  constructor(
    @Inject("SEQUELIZE")
    private readonly sequelize: Sequelize,
    @InjectModel(AssessmentMitigation)
    private readonly assessmentMitigationModel: typeof AssessmentMitigation,
    @InjectModel(AssessmentMitigationChecklists)
    private readonly assessmentMitigationChecklistsModel: typeof AssessmentMitigationChecklists,
    @InjectModel(AssessmentMitigationDiscussions)
    private readonly AssessmentMitigationDiscussionsModel: typeof AssessmentMitigationDiscussions,
    @InjectModel(AssessmentMitigationAttachments)
    private readonly assessmentMitigationAttachmentsModel: typeof AssessmentMitigationAttachments,
    @InjectModel(DiligenceReportProductionPlace)
    private readonly reportProductionPlaceModel: typeof DiligenceReportProductionPlace,
  ) {}

  async create(
    createAssessmentMitigationInput: CreateAssessmentMitigationInput
  ) {
    const { 
      dueDiligenceId,
      productionPlaceId,
      assessmentId,
      assessmentQuestionId,
      assessmentQuestionOptionId,
      mitigationStatus,
      assignedUserId,
      checkLists = [],
      assessmentResponseId,
    } = createAssessmentMitigationInput;
    let userFarmId = createAssessmentMitigationInput.userFarmId;

    if(!userFarmId) {
      const reportProductionPlace = await this.reportProductionPlaceModel.findOne({
        where: {
          diligenceReportId: dueDiligenceId,
          dueDiligenceProductionPlaceId: productionPlaceId,
        }
      });
      userFarmId = reportProductionPlace.farmId;
    }
    const existingAssessmentMitigation = await this.assessmentMitigationModel.findOne({
      where: {
        assessmentId,
        assessmentQuestionId,
        assessmentQuestionOptionId,
        userFarmId,
      }
    });

    if (existingAssessmentMitigation) {
      return existingAssessmentMitigation;
    }

    // Create the assessment mitigation record
    const savedAssessmentMitigation = await this.assessmentMitigationModel.create({
      dueDiligenceId,
      productionPlaceId,
      assessmentId,
      assessmentQuestionId,
      assessmentQuestionOptionId,
      mitigationStatus,
      assignedUserId,
      userFarmId,
      assessmentResponseId,
    });


    if (checkLists.length > 0) {
      const checkListsPayload = checkLists.map(c => ({
        assessmentMitigationId: savedAssessmentMitigation.id,
        checklistTitle: c.checklistTitle,
        isChecked: c.isChecked,
      }));

      await this.assessmentMitigationChecklistsModel.bulkCreate(checkListsPayload);

    }
   
    return savedAssessmentMitigation;
  }

  async createOrFind(
    createAssessmentMitigationInput: CreateAssessmentMitigationInput
  ) {
    const savedAssessmentMitigation = await this.create(createAssessmentMitigationInput);
    return await this.findOne(savedAssessmentMitigation.id);
  }

  async findOneForQuestion(
    userFarmId: number,
    assessmentId: number,
    assessmentQuestionId: number
  ) {
    // Construct the where clause dynamically based on provided parameters
    const whereClause: any = {
      userFarmId,
      assessmentId,
      assessmentQuestionId
    };
    const assessmentMitigation = await this.assessmentMitigationModel.findAndCountAll({
      where: whereClause,
      include: [
        this.assessmentMitigationChecklistsModel,
        {
          model: Farm,
        },
        { model: AssessmentQuestionOptions },
        {
          model: AssessmentQuestions,
          include: [
            {
              model: AssessmentQuestionHeading
            }
          ]

        },
        { model: Assessment },
        {
          model: AssessmentMitigationDiscussions,
          include: [
            { model: AssessmentMitigationAttachments },
            { model: User, as: "user" },
          ],
        },
      ],
    });

    if (!assessmentMitigation) {
      // throw new NotFoundException(
      //   "No Assessment Mitigation found for the given parameters"
      // );
      await this.assessmentMitigationModel.create({
        
      });
    }

    return assessmentMitigation;
  }

  findAll() {
    return `This action returns all assessmentMitigation`;
  }

  async findOne(id: number) {
    const assessmentMitigation = await this.assessmentMitigationModel.findOne({
      where:{id},
      include: [
        this.assessmentMitigationChecklistsModel,
        {
          model: DueDiligenceProductionPlace,
          include: [
            {
              model: Farm
            }
          ]
        },
        {
          model: AssessmentQuestionOptions
        },
        {
          model: AssessmentQuestions
        },
        {
          model: Assessment
        },
        {
          model: AssessmentMitigationDiscussions,
          include: [
            {
              model: AssessmentMitigationAttachments
            },
            {
                model: User,
                as : "user"              
              }
          ]
        }
      ],
    }
    );

    if (!assessmentMitigation) {
      throw new Error("Assessment Mitigation not found");
    }

    return assessmentMitigation;
  }

  async update(
    id: number,
    updateAssessmentMitigationInput: UpdateAssessmentMitigationInput
  ) {
    const existingMitigation = await this.findOne(id);

    const { checkLists } = updateAssessmentMitigationInput;

    await this.assessmentMitigationModel.update(
      {
        dueDiligenceId: updateAssessmentMitigationInput.dueDiligenceId,
        productionPlaceId: updateAssessmentMitigationInput.productionPlaceId,
        assessmentId: updateAssessmentMitigationInput.assessmentId,
        assessmentQuestionId:
          updateAssessmentMitigationInput.assessmentQuestionId,
        assessmentQuestionOptionId:
          updateAssessmentMitigationInput.assessmentQuestionOptionId,
        mitigationStatus: updateAssessmentMitigationInput.mitigationStatus,
        assignedUserId: updateAssessmentMitigationInput.assignedUserId,
      },
      { where: { id: existingMitigation.id } }
    );

    await this.assessmentMitigationChecklistsModel.destroy({
      where: { assessmentMitigationId: id },
    });

    if (checkLists?.length) {
      const checkListsPayload = checkLists?.map((c) => {
        return {
          assessmentMitigationId: id,
          checklistTitle: c.checklistTitle,
          isChecked: c.isChecked,
        };
      });

      if (checkLists.length) {
        await this.assessmentMitigationChecklistsModel.bulkCreate(
          checkListsPayload
        );
      }
    }

    return this.findOne(id);
  }

  remove(id: number) {
    return `This action removes a #${id} assessmentMitigation`;
  }

  async addMitigationDiscussion(
    createAssessmentMitigationDiscussionInput: CreateAssessmentMitigationDiscussionInput
  ) {
    const { attachments } = createAssessmentMitigationDiscussionInput;

    const savedDiscussion =
      await this.AssessmentMitigationDiscussionsModel.create({
        assessmentMitigationId:
          createAssessmentMitigationDiscussionInput.assessmentMitigationId,
        comment: createAssessmentMitigationDiscussionInput.comment,
        userId: createAssessmentMitigationDiscussionInput.userId,
      });

    if (attachments?.length) {
      const attachmentsPayload = attachments.map((a) => {
        return {
          assessmentMitigationId:
            createAssessmentMitigationDiscussionInput.assessmentMitigationId,
          assessmentMitigationDiscussionId: savedDiscussion.id,
          filePath: a.filePath,
          fileMetadata: a.fileMetadata,
        };
      });
      if (attachmentsPayload.length)
        await this.assessmentMitigationAttachmentsModel.bulkCreate(
          attachmentsPayload
        );
    }

    return this.AssessmentMitigationDiscussionsModel.findByPk(savedDiscussion.id, {
      include: [
        this.assessmentMitigationAttachmentsModel,
        {
          model: User,
          as :"user"
        }
      ]
    });
  }

 async findAllDiscussions(assessmentMitigationId: number) {
    return await this.AssessmentMitigationDiscussionsModel.findAll({
      where: { assessmentMitigationId },
      include: [this.assessmentMitigationAttachmentsModel, {
        model: User,
        as :"user"
      }],
    });
  }

  async findAllAttachments(assessmentMitigationId: number) {
    return await this.assessmentMitigationAttachmentsModel.findAll({
      where: { assessmentMitigationId },
    });
  }
}
