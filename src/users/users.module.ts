import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { MembershipModule } from 'src/membership/membership.module';
import { RoleModulePermissions } from './entities/role_module_mapping.entity';
import { Organization } from './entities/organization.entity';
import { UserDDS } from './entities/dds_user.entity';
import { UsersDdsService } from './users-dds.service';
import { UsersDdsResolver } from './users-dds.resolver';
import {UserController} from './users.controller'
import { Assessment } from 'src/assessment-builder/entities/assessment.entity';
import { AssessmentQuestionHeading } from 'src/assessment-builder/entities/assessment-question-headings.entity';
import { AssessmentQuestionOptions } from 'src/assessment-builder/entities/assessment-question-options.entity';
import { AssessmentQuestions } from 'src/assessment-builder/entities/assessment-questions.entity';
import { AssessmentSetting } from 'src/assessment-builder/entities/assessment-setting.entity';

@Module({
  imports: [
    MembershipModule,
    SequelizeModule.forFeature([User, UserDDS, RoleModulePermissions, Organization, Assessment, AssessmentQuestionHeading, AssessmentQuestionOptions, AssessmentQuestions, AssessmentSetting]),
  ],
  providers: [UsersResolver, UsersService, UsersDdsService, UsersDdsResolver],
  exports: [UsersService, UsersDdsService],
  controllers:[UserController]
})
export class UsersModule {}
