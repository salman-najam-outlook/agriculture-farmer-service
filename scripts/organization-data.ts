import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { Organization } from '../src/users/entities/organization.entity';
import * as fs from 'fs';



async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const orgRepo = dataSource.getRepository(Organization);
  const csvPath = 'dimitra_organization.csv'; // update path if necessary

  const records = []
  console.log(`Found ${records.length} records in CSV.`);

  for (const record of records) {
    const { code, id, isSubOrganization } = record;

    const org = await orgRepo.findOne({ where: { code } });

    if (!org) {
      console.warn(`Organization not found for orgCode: ${code}`);
      continue;
    }
    org.cf_id = id;
    org.isSubOrganization = isSubOrganization ? true : false;

    await orgRepo.save(org);
    console.log(`Updated organization: ${code}`);
  }

  await app.close();
  console.log('Done updating organizations.');
}

bootstrap();
