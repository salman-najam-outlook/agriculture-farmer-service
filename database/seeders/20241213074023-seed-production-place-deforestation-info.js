'use strict';
const { QueryTypes } = require('sequelize');

const getDeforestationStatus = (status) => {
  switch (status) {
    case 'Very High Probability':
      return 'Very High Deforestation Probability';
    case 'High Probability':
    case 'Hight Deforestation Probability':
      return 'High Deforestation Probability';
    case 'Medium Probability':
      return 'Medium Deforestation Probability';
    case 'Low Probability':
      return 'Low Deforestation Probability';
    case 'Very Low Probability':
      return 'Very Low Deforestation Probability';
    case 'Zero/Negligible Probability':
      return 'Zero/Negligible Deforestation Probability';
    default:
      return status;
  }
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const result = await queryInterface.sequelize.query(
        `
          SELECT
            ddpp.id as productionPlaceId,
            drr.id as deforestationId,
            ddpp.risk_mitigation_comment as deforestationMitigationComment,
            ddpp.eudr_deforestation_status as deforestationStatus,
            drr.overallProb as originalDeforestationStatus,
            drr.created_at as deforestationStatusDate,
            ddpp.lastMitigatedDate as lastDeforestationMitigationDate,
            ddpp.lastDisputeResolvedDate as lastDisputeResolvedDate,
            ddpp.risk_assessment_status as riskAssessmentStatus
          FROM due_diligence_production_places ddpp
          LEFT JOIN deforestation_report_requests drr
          ON ddpp.farmId = drr.farm_id and drr.created_at > ddpp.created_at
          WHERE (drr.id IS NOT NULL OR ddpp.risk_assessment_status IS NOT NULL) AND ddpp.productionPlaceDeforestationInfoId IS NULL
        `,
        {
          type: QueryTypes.SELECT,
          nest: true,
        }
      );

      await Promise.all(
        result.map((item) => {
          return queryInterface
            .insert(null, 'production_place_deforestation_info', {
              deforestationReportRequestId: item.deforestationId,
              deforestationMitigationComment: item.deforestationMitigationComment,
              deforestationStatus: getDeforestationStatus(item.deforestationStatus || item.originalDeforestationStatus),
              originalDeforestationStatus:
                getDeforestationStatus(item.originalDeforestationStatus) === 'Manually Mitigated'
                  ? null
                  : getDeforestationStatus(item.originalDeforestationStatus),
              deforestationStatusDate: item.deforestationStatusDate,
              lastDeforestationMitigationDate: item.lastDeforestationMitigationDate,
              lastDisputeResolvedDate: item.lastDisputeResolvedDate,
              riskAssessmentStatus: item.riskAssessmentStatus,
            })
            .then((result) => {
              return queryInterface.bulkUpdate(
                'due_diligence_production_places',
                {
                  productionPlaceDeforestationInfoId: result[0],
                },
                { id: item.productionPlaceId }
              );
            });
        })
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkUpdate('due_diligence_production_places', { productionPlaceDeforestationInfoId: null });
    await queryInterface.bulkDelete('production_place_deforestation_info');
  },
};
