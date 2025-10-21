import { Inject, Injectable } from "@nestjs/common";
import { CreateUserInput } from "./dto/create-user.input";
import { UpdateUserInput } from "./dto/update-user.input";
import { User } from "./entities/user.entity";
import { InjectModel } from "@nestjs/sequelize";
import { MembershipService } from "src/membership/membership.service";
import { RoleModulePermissions } from "./entities/role_module_mapping.entity";
import { Roles } from "src/core/roles";
import { Organization } from "./entities/organization.entity";
import { UserDDS } from "./entities/dds_user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private UserModel: typeof User,
    @InjectModel(Organization)
    private OrgModel: typeof Organization,
    @InjectModel(RoleModulePermissions)
    private roleModulePermission: typeof RoleModulePermissions,
    private readonly membershipService: MembershipService
  ) {}
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

    userExists = await this.UserModel.findAll({
      where: whereCondition,
    });

    if (userExists.length == 0) {
      // Add source tracking
      const userData = {
        ...createUserInput,
        source: createUserInput.source || 'farmer_service'
      };
      let res = await this.UserModel.create(userData);
      return res;
    } else {
      throw new Error('User already exists with this email or mobile number!');
    }
  }

  async findAll(): Promise<User[]> {
    let userRes = [];
    userRes = await this.UserModel.findAll();
    return userRes;
  }

  async findOne(id: number) {
    return await this.UserModel.findOne({ where: { id } });
  }

  async findOneByEmail(email: string) {
    return await this.UserModel.findOne({ where: { email } });
  }

  async findByOrganization(organizationId: number) {
    return await this.UserModel.findAll({
      where: {
        organization: organizationId
      }
    });
  }

  async currentUser(id: number) {
    const userDetail = await this.UserModel.findOne({ where: { id } });
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

  update(id: number, updateUserInput: UpdateUserInput) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findAllSuppliers(): Promise<User[]> {
    return await this.UserModel.findAll({ where: { role: "supplier" } });
  }

}
