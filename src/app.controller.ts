import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Organization } from './users/entities/organization.entity';
import { InjectModel } from "@nestjs/sequelize";

@Controller()
export class AppController {
  constructor(
    @InjectModel(Organization)
    private organization: typeof Organization,
    private readonly appService: AppService
  ) {}

  @Get()
  async getHello() {

  // const records = [];

  // const organizations = await this.organization.findAll({});
  // for(const org of organizations) {
  //   if(org.isSubOrganization) {
  //     const parentOrg = records.find(record => record.id === org.cf_id);
  //     const parent_id = organizations.find(o => o.cf_id === parentOrg?.parentId)?.id || null;
  //      org.parent_id = parent_id
  //      await org.save();
  //   }
  // }
  // console.log(`Updated parent_id for sub-organizations.`);
  // return 
  // console.log(`Found ${records.length} records in CSV.`);

  // for (const record of records) {
  //   const { code, id, isSubOrganization } = record;

  //   const org = await this.organization.findOne({ where: { code } });

  //   if (!org) {
  //     console.warn(`Organization not found for orgCode: ${code}`);
  //     continue;
  //   }
  //   org.cf_id = id;
  //   org.isSubOrganization = isSubOrganization ? true : false;

  //   await org.save();
  //   console.log(`Updated organization: ${code}`);
  // }
    return this.appService.getHello();
  }
}
