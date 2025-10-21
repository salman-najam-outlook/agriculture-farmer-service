import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { UserDDS } from "./entities/dds_user.entity";
import { Organization } from "./entities/organization.entity";
import { RoleModulePermissions } from "./entities/role_module_mapping.entity";
import { MembershipService } from "src/membership/membership.service";
import { CreateUserInput } from "./dto/create-user.input";
import { Roles } from "src/core/roles";
import { ISyncUser } from "./dto/sync-user.input";
import { questions } from '../helpers/default-dimitra-assessment-data';
import { Assessment } from "src/assessment-builder/entities/assessment.entity";
import { AssessmentSetting } from "src/assessment-builder/entities/assessment-setting.entity";
import { AssessmentQuestionHeading } from "src/assessment-builder/entities/assessment-question-headings.entity";
import { AssessmentQuestionOptions } from "src/assessment-builder/entities/assessment-question-options.entity";
import { AssessmentQuestions } from "src/assessment-builder/entities/assessment-questions.entity";
import { UpdateUserInput } from "./dto/update-user.input";
import { GetTokenData } from "src/decorators/get-token-data.decorator";
import { Op } from "sequelize";
@Injectable()
export class UsersDdsService {
  constructor(
    @InjectModel(UserDDS)
    private UserDDSModel: typeof UserDDS,
    @InjectModel(Organization)
    private OrgModel: typeof Organization,
    @InjectModel(RoleModulePermissions)
    private roleModulePermission: typeof RoleModulePermissions,
    @InjectModel(Assessment)
    private AssessmentModel: typeof Assessment,
    @InjectModel(AssessmentSetting)
    private AssessmentSettingModel: typeof AssessmentSetting,
    @InjectModel(AssessmentQuestionHeading)
    private AssessmentQuestionHeadingModel: typeof AssessmentQuestionHeading,
    @InjectModel(AssessmentQuestionOptions)
    private AssessmentQuestionOptionsModel: typeof AssessmentQuestionOptions,
    @InjectModel(AssessmentQuestions)
    private AssessmentQuestionsModel: typeof AssessmentQuestions,
    private readonly membershipService: MembershipService
  ) {}

  async update(id: number, updateUserInput: UpdateUserInput) {
    const user = await this.UserDDSModel.findOne({
      where: {
        cf_userid: updateUserInput.cf_userid
      }
    });

    if (!user) {
      updateUserInput.cf_userid = id;
      const res = await this.UserDDSModel.create({ ...updateUserInput });
      return res;
    }

    const [affectedCount] = await this.UserDDSModel.update({ ...updateUserInput }, {
      where: {
        cf_userid: updateUserInput.cf_userid
      }
    });

    if (affectedCount === 0) {
      throw Error(`Failed to update User DDS record for id: ${id}`);
    }

    return await this.UserDDSModel.findByPk(id);
  }

  async create(createUserInput: CreateUserInput) {
    let userExists = [];
    for (let key in createUserInput) {
      if (
        (!createUserInput[key] ||
          createUserInput[key] == "undefined" ||
          createUserInput[key] == "null") &&
        createUserInput[key] != 0
      ) {
        delete createUserInput[key];
      }
    }

    // Check for existing user by email or mobile
    const whereCondition: any = {};
    if (createUserInput.email) {
      whereCondition.email = createUserInput.email;
    }
    if (createUserInput.mobile) {
      whereCondition.mobile = createUserInput.mobile;
    }

    userExists = await this.UserDDSModel.findAll({
      where: whereCondition,
    });

    if (userExists.length == 0) {
      // Add source tracking
      const userData = {
        ...createUserInput,
        source: createUserInput.source || 'farmer_service'
      };
      let res = await this.UserDDSModel.create(userData);
      return res;
    } else {
      throw new Error("User already exists with this email or mobile number!");
    }
  }

  async findAll(): Promise<UserDDS[]> {
    let userRes = [];
    userRes = await this.UserDDSModel.findAll();
    return userRes;
  }

  async findOne(id: number) {
    return await this.UserDDSModel.findOne({ where: { id } });
  }

  async findByCfID(id: number) {
    return await this.UserDDSModel.findOne({ where: { cf_userid:id } });
  }

  async findByCFIds(ids){
    return await this.UserDDSModel.findAll({ 
      where: { cf_userid:{[Op.in]:ids}}
     });
  }

  async findOneByEmail(email: string) {
    return await this.UserDDSModel.findOne({ where: { email } });
  }

  async findByOrganization(organizationId: number) {
    return await this.UserDDSModel.findAll({
      where: {
        organization: organizationId,
      },
    });
  }

  async currentUser(id: number) {
    const userDetail = await this.UserDDSModel.findOne({ where: { id } });
    Logger.log(userDetail);
    const permissions = await this.roleModulePermission.findAll({
      attributes: ["module_id"],
      where: { role: userDetail?.role || Roles.FARMER },
    });
    const getUserCurrentMembershipPlan =
      await this.membershipService.getUserCurrentMembershipPlan(id);
    return {
      userDetail,
      getUserCurrentMembershipPlan,
      modules: permissions.map((m) => m.module_id),
    };
  }

  async findAllSuppliersOrOperators(organizationId:number, role:string, subOrganizationId = null): Promise<UserDDS[]> {
    return await this.UserDDSModel.findAll({ where: { role, organization:organizationId, ...(subOrganizationId && {subOrganizationId:subOrganizationId}), active: 1 }, order: [['createdAt','DESC']] });
  }

  
  async synchronizeUserDetails(userSyncInput: ISyncUser, retryCount = 3, @GetTokenData('userid') userId?: number): Promise<any> {
    const { organization, cfUserId, email } = userSyncInput;
    try{
      let organizationExists = null;
      let subOrganizationExists = null;

      if (organization && organization.name && organization.code) {
        try {
          organizationExists = await this.OrgModel.findOne({
            where: {
              code: organization.code,
            },
          });
          if (!organizationExists) {
            organizationExists = await this.OrgModel.create({name: organization.name, code: organization.code, cf_id:organization?.id});
          }
          // Fetch all matching assessments
          const assessments = await this.AssessmentModel.findAll({
            where: { org_id: organizationExists.id, is_default: 1, isDeleted: false },
            raw: true
          });
          // If duplicates are found, keep the first one and remove the others
          if (assessments.length > 1) {
            const [primaryAssessment, ...duplicates] = assessments;
            await Promise.all(
              duplicates.map((duplicate) =>
                this.AssessmentModel.update(
                  { isDeleted: true },
                  { where: { id: duplicate.id } }
                )
              )
            );
          } else if (assessments.length === 1 && assessments[0].isDeleted) {
            await this.AssessmentModel.update(
              { isDeleted: false },
              { where: { id: assessments[0].id } }
            );
          } else if (assessments.length === 0) {
            await this.createDefaultDimitraAssessment(organizationExists.id);
          }
        } catch (error) {
          console.error('Error in organization synchronization:', error);
          throw new Error('Failed to synchronize organization');
        }
      } else {
        Logger.log("No main organization data provided or missing name/code");
      }
      const subOrganization = organization?.subOrganization;
      if(subOrganization && subOrganization.name && subOrganization.code) {
        try {
          subOrganizationExists = await this.OrgModel.findOne({
            where: {
              code: subOrganization?.code,
            },
          }); 
          if (!subOrganizationExists) {
            const subOrgData: any = {
              name: subOrganization.name, 
              code: subOrganization.code,
              cf_id: subOrganization?.id,
              isSubOrganization: true
            };
            
            if (organizationExists) {
              subOrgData.parent_id = organizationExists.id;
            }
            
            subOrganizationExists = await this.OrgModel.create(subOrgData);
          }
        } catch (error) {
          Logger.error('Failed to synchronize suborganization:', error);
        }
      } else {
        Logger.log("No suborganization data provided or missing name/code");
      }

      // Build where condition based on available data
      const whereCondition: any = {};
      if (email) {
        whereCondition.email = email;
      }
      if (cfUserId) {
        whereCondition.cf_userid = cfUserId;
      }
      
      let userAlreadyExists = await this.UserDDSModel.findOne({
        where: whereCondition,
      });

      if (!userAlreadyExists) {
        userAlreadyExists = await this.UserDDSModel.create({
          firstName: userSyncInput.firstName,
          lastName: userSyncInput.lastName,
          countryCode: userSyncInput.countryCode,
          countryId: userSyncInput.countryId,
          countryIsoCode: userSyncInput.countryIsoCode,
          mobile: userSyncInput.mobile,
          email: userSyncInput.email,
          organization: organizationExists ? organizationExists.id : null,
          subOrganizationId: subOrganizationExists ? subOrganizationExists.id : null,
          role: userSyncInput.role,
          verified: userSyncInput.verified,
          address: userSyncInput.address,
          language: userSyncInput.language,
          eori_number: userSyncInput.eoriNumber,
          licenseNumber: userSyncInput.licenseNumber,
          companyId: userSyncInput.companyId,
          cf_userid: cfUserId,
          active: userSyncInput.active,
          profilePicUrl: userSyncInput?.profilePicUrl,
          registrationUserType: userSyncInput?.registrationUserType,
          createdBy: userId,
          source: userSyncInput.source || 'saas_api_sync'
        });
      } else {
        await this.UserDDSModel.update(
          {
            cf_userid: cfUserId,
            firstName: userSyncInput.firstName,
            lastName: userSyncInput.lastName,
            countryCode: userSyncInput.countryCode,
            countryId: userSyncInput.countryId,
            countryIsoCode: userSyncInput.countryIsoCode,
            mobile: userSyncInput.mobile,
            email: userSyncInput.email,
            organization: organizationExists ? organizationExists.id : null,
            subOrganizationId: subOrganizationExists ? subOrganizationExists.id : null,
            role: userSyncInput.role,
            verified: userSyncInput.verified,
            address: userSyncInput.address,
            language: userSyncInput.language,
            eori_number: userSyncInput.eoriNumber,
            licenseNumber: userSyncInput.licenseNumber,
            companyId: userSyncInput.companyId,
            active: userSyncInput.active,
            profilePicUrl: userSyncInput?.profilePicUrl,
            registrationUserType: userSyncInput?.registrationUserType,
          },
          {
            where: {
              id: userAlreadyExists.id,
            },
          }
        );
        userAlreadyExists = await this.UserDDSModel.findOne({ where: { id: userAlreadyExists.id } });
      }
      return userAlreadyExists;
    }
    catch (error) {
      Logger.error(`Error in synchronizeUserDetails attempt ${4 - retryCount}:`, error);
      Logger.error(`Error in synchronizeUserDetails attempt ${4 - retryCount}:`, error.stack);
      // Retry mechanism
      if (retryCount > 1) {
        Logger.log(`Retrying... (${retryCount - 1} attempts left)`);
        return await this.synchronizeUserDetails(userSyncInput, retryCount - 1, userId);
      } else {
        Logger.error('Failed to synchronize user after multiple attempts');
        throw error;
      }
    }
  }

  async deleteUserFromDDS(deleteData: { cfUserId: number; organizationId: number; action: string; source: string }) {
    const { cfUserId } = deleteData;
    
    try {
      const userToDelete = await this.UserDDSModel.findOne({
        where: { cf_userid: cfUserId }
      });

      if (!userToDelete) {
        Logger.warn(`User with cf_userid ${cfUserId} not found in DDS database`);
        return { success: false, message: 'User not found' };
      }

      // Soft delete: Set user as inactive
      await this.UserDDSModel.update(
        { 
          active: false,
          deletedAt: new Date(),
          source: deleteData.source || 'saas_api_delete'
        },
        { where: { cf_userid: cfUserId } }
      );

      
      return {
        success: true,
        message: 'User deleted successfully from DDS',
        deletedUserId: cfUserId,
        deletedUserName: `${userToDelete.firstName} ${userToDelete.lastName}`,
        organizationId: userToDelete.organization,
      };

    } catch (error) {
      Logger.error(`Error deleting user from DDS (cfUserId: ${cfUserId}):`, error);
      throw error;
    }
  }

  async hardDeleteUserFromDDS(deleteData: { cfUserId: number; organizationId: number; action: string; source: string }) {
    const { cfUserId } = deleteData;
    
    try {
      // Find user by cf_userid
      const userToDelete = await this.UserDDSModel.findOne({
        where: { cf_userid: cfUserId }
      });

      if (!userToDelete) {
        Logger.warn(`User with cf_userid ${cfUserId} not found in DDS database`);
        return { success: false, message: 'User not found' };
      }

      // Hard delete: Permanently remove user
      await this.UserDDSModel.destroy({
        where: { cf_userid: cfUserId }
      });

      return {
        success: true,
        message: 'User permanently deleted from DDS',
        deletedUserId: cfUserId,
        deletedUserName: `${userToDelete.firstName} ${userToDelete.lastName}`,
        organizationId: userToDelete.organization,
      };

    } catch (error) {
      Logger.error(`Error hard deleting user from DDS (cfUserId: ${cfUserId}):`, error);
      throw error;
    }
  }


  async createDefaultDimitraAssessment(orgId: number) {
    try {
      const currentDate = new Date().toISOString();
      // Create a new Date object and modify the year to the next year
      const nextYearDate = new Date();
      nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);

      const nextYearDateString = nextYearDate.toISOString();

      const assessmentPayload = {
        orgId: orgId,
        userId: null, // System default
        title: "Farmer Self Risk Assessment Survey",
        countries: ["All"], // Available for all countries
        description:
          "This is a default dimitra risk assessment survey applicable to all countries.",
        assessmentType: "USER_CUSTOM",
        noOfQuestions: questions.length ?? 0,
        noOfResponse: 0,
        status: "ACTIVE",
        isApplicableToSelectedUsersOnly: 0,
        is_deleted: 0,
        createdAt: currentDate,
        updatedAt: currentDate,
        is_default: 1,
      };

      // Insert default assessment for the organization
      const assessment = await this.AssessmentModel.create(assessmentPayload);

      const assessmentSettings = {
        assessmentId: assessment.id,
        expiryDate: nextYearDateString, // add 12 months
        isScheduled: false,
        scheduleDate: currentDate,
        scheduledEndDate: currentDate,
        isMultiStep: true,
        multiStepType: "HEADINGS",
        noOfQuestion: 0,
        allowMultipleEntries: "ANY_TIME",
      };

      // Create assessment settings
      await this.AssessmentSettingModel.create(assessmentSettings);

      // Insert question headings data
      for (const [headingIndex, questionData] of questions.entries()) {
        const questionPayload = {
          assessmentId: assessment.id,
          title: questionData.heading,
          order: headingIndex + 1,
        };

        const insertedHeading =
          await this.AssessmentQuestionHeadingModel.create(questionPayload);

        // Insert questions and options
        for (const [
          questionIndex,
          question,
        ] of questionData.questions.entries()) {
          const questionPayload = {
            assessmentId: assessment.id,
            title: question.title,
            assessmentQuestionType: question.assessmentQuestionType,
            isMandatory: 0,
            isEnabled: 1,
            isFileType: question.isFileType ?? 0,
            fileTypeAdditionalSettings: question.fileTypeAdditionalSettings
              ? question.fileTypeAdditionalSettings
              : null,
            headingId: insertedHeading.id,
            order: questionIndex + 1,
            createdAt: currentDate,
            updatedAt: currentDate,
          };
          const insertedQuestion =
            await this.AssessmentQuestionsModel.create(questionPayload);

          // If the question has answers, insert them
          if (question.answers && question.answers.length > 0) {
            for (const answer of question.answers) {
              const answerPayload = {
                assessmentQuestionId: insertedQuestion.id,
                label: answer.label,
                value: answer.value,
                checklists:
                  question.checklists && answer.value == "high"
                    ? question.checklists
                    : [],
              };

              await this.AssessmentQuestionOptionsModel.create(answerPayload);
            }
          }
        }
      }
      return true;
    } catch (error) {
      Logger.error("Error in default risk assessment.");
      throw error;
    }
  }
}
