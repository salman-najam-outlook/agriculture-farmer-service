import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

async function main() {
  const args = process.argv.slice(2);
  const reportIdArg = args.find(a => a.startsWith('--reportId='));
  if (!reportIdArg) {
    console.error('Usage: npm run cron:revert -- --reportId=<ID>');
    process.exit(1);
  }
  const reportId = parseInt(reportIdArg.split('=')[1], 10);
  if (!reportId || isNaN(reportId)) {
    console.error('Invalid reportId');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });
  await app.init();

  try {
    // Get Sequelize instance registered under the provider token 'SEQUELIZE'
    const sequelize: any = app.get('SEQUELIZE');

    // 1) Select all deforestation info rows linked to the report that have original status stored
    const [rows] = await sequelize.query(
      `SELECT ppdi.id, ppdi.originalDeforestationStatusForTemporaryApproval AS original
       FROM production_place_deforestation_info ppdi
       INNER JOIN diligence_reports_due_diligence_production_places drpp
         ON drpp.productionPlaceDeforestationInfoId = ppdi.id
       WHERE drpp.diligenceReportId = :reportId
         AND ppdi.originalDeforestationStatusForTemporaryApproval IS NOT NULL`,
      { replacements: { reportId } }
    );

    if (!rows || rows.length === 0) {
      console.log(`No production place deforestation info to revert for reportId=${reportId}`);
      return;
    }

    // 2) Revert each row
    for (const row of rows) {
      await sequelize.query(
        `UPDATE production_place_deforestation_info
         SET deforestationStatus = :original,
             originalDeforestationStatusForTemporaryApproval = NULL
         WHERE id = :id`,
        { replacements: { id: row.id, original: row.original } }
      );
      console.log(`Reverted deforestation info id=${row.id} to '${row.original}'`);
    }

    console.log(`Revert executed for reportId=${reportId}. Total reverted: ${rows.length}`);
  } catch (err) {
    console.error('Error running revert:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

main();


// "cron:revert": "ts-node -r tsconfig-paths/register scripts/revert-temp-approval.ts"  // npm run cron:revert -- --reportId=763