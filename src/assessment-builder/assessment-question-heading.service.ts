import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { AssessmentBuilderService } from "./assessment-builder.service";
import { AssessmentQuestionHeading } from "./entities/assessment-question-headings.entity";
import { CreateAssessmentQuestionHeadingInput } from "./dto/create-assessment-question-heading.input";
import { MultiStepAssessmentType } from "./dto/MultiStepAssessmentType";
import { Op } from "sequelize";

@Injectable()
export class AssessmentQuestionHeadingService {
  constructor(
    @Inject("SEQUELIZE")
    private readonly sequelize: Sequelize,

    @InjectModel(AssessmentQuestionHeading)
    private readonly assessmentQuestionHeadingModel: typeof AssessmentQuestionHeading,

    private readonly assessmentBuilderService: AssessmentBuilderService
  ) { }

  async create(
    createAssessmentQuestionHeadingInput: CreateAssessmentQuestionHeadingInput
  ) {
    try {
      const { assessmentId, title } = createAssessmentQuestionHeadingInput;
      const assessmentDetail = await this.assessmentBuilderService.findOne(
        assessmentId
      );

      if (
        assessmentDetail?.assessmentSettings?.isMultiStep &&
        assessmentDetail.assessmentSettings.multiStepType !==
        MultiStepAssessmentType.HEADINGS
      ) {
        throw new Error(
          `Cannot add headings to assessment with ${assessmentDetail.assessmentSettings.multiStepType} type`
        );
      }
      const lastOrderOfAssessment =
        (await this.countOfAssessments(assessmentId)) + 1;

      return await this.assessmentQuestionHeadingModel.create({
        assessmentId,
        order: lastOrderOfAssessment,
        title,
      });
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  }

  async getHeadingOfAssessment(assessmentId: number, search: string = null) {
    let where: any = {
      assessmentId: assessmentId,
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
    return await this.assessmentQuestionHeadingModel.findAll({
      where,
      order: [["order", "ASC"]],
    });
  }

  async findOne(id: number) {
    const detail = await this.assessmentQuestionHeadingModel.findOne({
      where: { id },
    });
    if (!detail) {
      throw new Error("Heading not found");
    }
    return detail;
  }

  async update(
    headingId: number,
    assessmentHeadingTitle?: string,
    order?: number
  ) {
    const updatePayload: any = {};

    if (assessmentHeadingTitle) {
      updatePayload.title = assessmentHeadingTitle;
    }
    if (order) {
      updatePayload.order = order;
    }

    await this.assessmentQuestionHeadingModel.update(updatePayload, {
      where: { id: headingId },
    });

    return this.findOne(headingId);
  }

  async countOfAssessments(assessmentId: number) {
    return await this.assessmentQuestionHeadingModel.count({
      where: { assessmentId },
    });
  }

  async remove(id: number) {
    const detail = await this.findOne(id);

    await this.assessmentQuestionHeadingModel.destroy({ where: { id } });
    const remainingHeadingInOrder = await this.getHeadingOfAssessment(
      detail.assessmentId
    );
    for (let i = 1; i <= remainingHeadingInOrder.length; i++) {
      const heading = remainingHeadingInOrder[i];
      await this.update(heading.id, heading.title, i);
    }
    return true;
  }

  async reorderHeading(
    assessmentId: number,
    headingId: number,
    newOrder: number
  ) {
    const headings = await this.assessmentQuestionHeadingModel.findAll({
      attributes: ["id", "order"],
      where: {
        assessmentId,
      },
      order: [["order", "ASC"]],
    });

    // Find the item
    const itemIndex = headings.findIndex((item) => item.id === headingId);
    if (itemIndex === -1) {
      throw new Error("Heading not found.");
    }

    // Remove the item from the list
    const [item] = headings.splice(itemIndex, 1);

    // Insert the item at the new index
    headings.splice(newOrder - 1, 0, item);

    for (let i = 0; i <= headings.length; i++) {
      const element = headings[i];
      await this.update(element.id, undefined, i+1);
    }

    return true;
  }
}
