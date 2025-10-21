'use strict';

const moment = require('moment/moment');
const { Op } = require('sequelize');
const { QueryTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Find all duplicated production place with it's parent production place
      // WHERE copyOf IS NOT NULL OR id IN (SELECT DISTINCT(copyOf) FROM due_diligence_production_places)
      const productionPlaces = await queryInterface.sequelize.query(
        `
          SELECT * FROM due_diligence_production_places
        `,
        {
          type: QueryTypes.SELECT,
        }
      );

      // Group duplicate production place by top level parent id
      const productionPlaceGroupByParentId = {};
      productionPlaces.forEach((place) => {
        let topLevelParent = place;
        if (place.copyOf) {
          while (topLevelParent.copyOf) {
            const newParent = productionPlaces.find((item) => item.id == topLevelParent.copyOf);
            if (!newParent) break;
            topLevelParent = newParent;
          }
        }
        if (productionPlaceGroupByParentId[topLevelParent.id]) {
          productionPlaceGroupByParentId[topLevelParent.id].push(place);
        } else {
          productionPlaceGroupByParentId[topLevelParent.id] = [place];
        }
      });

      // Find latest production place for top level parent id
      const latestProductionPlace = {};
      for (const id in productionPlaceGroupByParentId) {
        const places = productionPlaceGroupByParentId[id];
        let latest = places[0];
        for (const place of places) {
          if (place !== latest) {
            if (moment(place.created_at).isAfter(latest.created_at)) latest = place;
          }
        }
        latestProductionPlace[id] = latest;
      }

      // Attach production places to diligence reports
      const diligenceReportProductionPlaceArray = [];
      for (const id in productionPlaceGroupByParentId) {
        const latest = latestProductionPlace[id];
        const places = productionPlaceGroupByParentId[id];
        places.forEach((place) => {
          if (latest.latestGeofenceId) {
            const exists = diligenceReportProductionPlaceArray.find(
              (item) =>
                item.diligenceReportId == place.dueDiligenceReportId && item.dueDiligenceProductionPlaceId == latest.id
            );
            if(!exists) {
              diligenceReportProductionPlaceArray.push({
                farmId: latest.farmId,
                diligenceReportId: place.dueDiligenceReportId,
                dueDiligenceProductionPlaceId: latest.id,
                geofenceId: latest.latestGeofenceId,
                isDisregarded: place.disregard_status,
                warnings: place.warnings ? JSON.stringify(place.warnings) : null,
                removed: place.removed,
                productionPlaceDeforestationInfoId: place.productionPlaceDeforestationInfoId,
              });
            }
          }
        });
      }
      await queryInterface.bulkInsert(
        'diligence_reports_due_diligence_production_places',
        diligenceReportProductionPlaceArray
      );

      const diligenceReportProductionPlaces = await queryInterface.sequelize.query(
        `SELECT * FROM diligence_reports_due_diligence_production_places`,
        {
          type: QueryTypes.SELECT,
        }
      );

      // Seed on risk_mitigation files
      await queryInterface.bulkUpdate(
        'risk_mitigation_files',
        {
          deprecated_production_place_id: Sequelize.literal(`production_place_id`),
        },
        {
          deprecated_production_place_id: { [Op.is]: null },
        }
      );

      await Promise.all(
        Object.keys(productionPlaceGroupByParentId).map((id) => {
          const placeIds = productionPlaceGroupByParentId[id].map((place) => place.id);
          const latestId = latestProductionPlace[id].id;
          return queryInterface.bulkUpdate(
            'risk_mitigation_files',
            {
              production_place_id: latestId,
            },
            {
              production_place_id: { [Op.in]: placeIds },
            }
          );
        })
      );

      // Attach risk mitigation files to diligence reports
      const riskMitigationFiles = await queryInterface.sequelize.query(
        `
          SELECT id, production_place_id, deprecated_production_place_id FROM risk_mitigation_files
        `,
        {
          type: QueryTypes.SELECT,
        }
      );
      const diligenceReportRiskMitigationFileArray = [];
      for (const mitigation of riskMitigationFiles) {
        const productionPlace = productionPlaces.find((place) => place.id == mitigation.deprecated_production_place_id);
        const diligenceReportProductionPlace = diligenceReportProductionPlaces.find(
          (place) =>
            place.dueDiligenceProductionPlaceId == mitigation.production_place_id &&
            productionPlace.dueDiligenceReportId == place.diligenceReportId
        );
        diligenceReportRiskMitigationFileArray.push({
          riskMitigationFileId: mitigation.id,
          diligenceReportProductionPlaceId: diligenceReportProductionPlace.id,
        });
      }
      await queryInterface.bulkInsert(
        'diligence_reports_places_risk_mitigation_files',
        diligenceReportRiskMitigationFileArray
      );

      // Seed on production_place_disputes
      await queryInterface.bulkUpdate(
        'production_place_disputes',
        {
          deprecatedProductionPlaceId: Sequelize.literal(`productionPlaceId`),
        },
        {
          deprecatedProductionPlaceId: { [Op.is]: null },
        }
      );

      const disputeProductionPlaces = await queryInterface.sequelize.query(
        `
          SELECT ddpp.id as id, ppdi.deforestationReportRequestId as requestId FROM due_diligence_production_places ddpp
          INNER JOIN production_place_disputes ppd
          ON ppd.productionPlaceid = ddpp.id
          LEFT JOIN production_place_deforestation_info ppdi
          ON ppdi.id = ddpp.productionPlaceDeforestationInfoId
        `,
        {
          type: QueryTypes.SELECT,
        }
      );
      await Promise.all(
        disputeProductionPlaces.map((place) => {
          const parentId = Object.keys(productionPlaceGroupByParentId).find((id) =>
            productionPlaceGroupByParentId[id].find((p) => p.id == place.id)
          );
          const latestId = latestProductionPlace[parentId].id;
          return queryInterface.bulkUpdate(
            'production_place_disputes',
            {
              productionPlaceId: latestId,
              deforestationReportRequestId: place.requestId,
            },
            {
              productionPlaceId: place.id,
            }
          );
        })
      );

      // Seed farm on assessment uploads
      const assessmentUploads = await queryInterface.sequelize.query(
        `
          SELECT ddpp.id as placeId, au.id as id, app.riskAssessmentStatus as status, au.diligence_report_id as reportId
          FROM assessment_uploads au
          LEFT JOIN due_diligence_production_places ddpp
          ON au.production_place_id = ddpp.id
          LEFT JOIN assessment_production_place app
          ON app.diligenceReportId = au.diligence_report_id AND app.assessmentId = au.assessment_id
        `,
        {
          type: QueryTypes.SELECT,
        }
      );
      await Promise.all(
        assessmentUploads.map((upload) => {
          const parentId = upload.placeId
            ? Object.keys(productionPlaceGroupByParentId).find((id) =>
                productionPlaceGroupByParentId[id].find((p) => p.id == upload.placeId)
              )
            : null;
          const farmId = parentId ? latestProductionPlace[parentId].farmId : null;
          upload.farmId = farmId;
          return queryInterface.bulkUpdate(
            'assessment_uploads',
            {
              farmId,
              riskAssessmentStatus: upload.status,
            },
            { id: upload.id }
          );
        })
      );

      // Attach diligence report with assessment uploads
      const diligenceReportAssessmentUploadArray = [];
      for (const upload of assessmentUploads) {
        const exists = diligenceReportAssessmentUploadArray.find(
          (item) => item.diligenceReportId == upload.reportId && item.assessmentUploadId == upload.id
        );
        if (!exists && upload.reportId && upload.reportId > 0) {
          const diligenceReportProductionPlace = diligenceReportProductionPlaces.find(
            (place) => place.farmId == upload.farmId && upload.reportId == place.diligenceReportId
          );
          diligenceReportAssessmentUploadArray.push({
            diligenceReportId: upload.reportId,
            assessmentUploadId: upload.id,
            diligenceReportProductionPlaceId: diligenceReportProductionPlace?.id || null,
          });
        }
      }
      await queryInterface.bulkInsert('diligence_reports_assessment_uploads', diligenceReportAssessmentUploadArray);

      // Seed farm on assessment survey
      const surveys = await queryInterface.sequelize.query(
        `
          SELECT a.id as id, ddpp.id as placeId, app.riskAssessmentStatus as status, a.due_diligence_id as reportId
          FROM assessment_surveys a
          LEFT JOIN assessment_production_place app
          ON a.due_diligence_id = app.diligenceReportId AND app.assessmentId = a.assessment_id
          LEFT JOIN due_diligence_production_places ddpp
          ON ddpp.id = a.farm_id
        `,
        {
          type: QueryTypes.SELECT,
        }
      );
      await Promise.all(
        surveys.map((survey) => {
          const parentId = survey.placeId
            ? Object.keys(productionPlaceGroupByParentId).find((id) =>
                productionPlaceGroupByParentId[id].find((p) => p.id == survey.placeId)
              )
            : null;
          const farmId = parentId ? latestProductionPlace[parentId].farmId : null;
          survey.farmId = farmId;
          return queryInterface.bulkUpdate(
            'assessment_surveys',
            {
              user_farm_id: farmId,
              riskAssessmentStatus: survey.status,
              originalRiskAssessmentStatus: survey.status === 'rejected' ? null : survey.status,
            },
            {
              id: survey.id,
            }
          );
        })
      );

      // Attach diligence reports with assessment survey
      const diligenceReportSurveyArray = [];
      for (const survey of surveys) {
        const exists = diligenceReportSurveyArray.find(
          (item) => item.diligenceReportId == survey.reportId && item.assessmentSurveyid == survey.id
        );
        if (!exists && survey.reportId && survey.reportId > 0) {
          const diligenceReportProductionPlace = diligenceReportProductionPlaces.find(
            (place) => place.farmId == survey.farmId && survey.reportId == place.diligenceReportId
          );
          diligenceReportSurveyArray.push({
            diligenceReportId: survey.reportId,
            assessmentSurveyid: survey.id,
            diligenceReportProductionPlaceId: diligenceReportProductionPlace?.id || null,
          });
        }
      }
      await queryInterface.bulkInsert('diligence_reports_assessment_surveys', diligenceReportSurveyArray);

      // Attach diligence report with assessment response
      const assessmentResponses = await queryInterface.sequelize.query(
        `
          SELECT ar.id as id, a.due_diligence_id as reportId FROM assessment_responses ar
          INNER JOIN assessment_surveys a
          ON ar.survey_id = a.id
          WHERE a.due_diligence_id IS NOT NULL AND a.due_diligence_id > 0
        `,
        {
          type: QueryTypes.SELECT,
        }
      );
      await queryInterface.bulkInsert(
        'diligence_reports_assessment_responses',
        assessmentResponses.map((response) => ({
          diligenceReportId: response.reportId,
          assessmentResponseId: response.id,
        }))
      );

      // Seed farm on assessment_question_mitigation
      const mitigations = await queryInterface.sequelize.query(
        `
          SELECT id, dueDiligenceId, productionPlaceId, assessmentQuestionId, assessmentQuestionOptionId
          FROM assessment_question_mitigation aqm
        `,
        {
          type: QueryTypes.SELECT,
        }
      );

      await Promise.all(
        mitigations.map(async (mitigation) => {
          const response = await queryInterface.sequelize.query(
            `
              SELECT * FROM assessment_responses ar
              INNER JOIN assessment_surveys a
              ON a.id = ar.survey_id
              WHERE
              a.due_diligence_id = :dueDiligenceId
              AND a.farm_id = :productionPlaceId
              AND ar.question_id = :assessmentQuestionId
              AND JSON_CONTAINS(JSON_EXTRACT(ar.response, '$.selectedOptions[*].selectedOptionId'), CAST(:assessmentQuestionOptionId AS JSON))
            `,
            {
              type: QueryTypes.SELECT,
              plain: true,
              replacements: mitigation,
            }
          );
          const parentId = mitigation.productionPlaceId
            ? Object.keys(productionPlaceGroupByParentId).find((id) =>
                productionPlaceGroupByParentId[id].find((p) => p.id == mitigation.productionPlaceId)
              )
            : null;
          const farmId = parentId ? latestProductionPlace[parentId].farmId : null;
          return queryInterface.bulkUpdate(
            'assessment_question_mitigation',
            {
              userFarmId: farmId,
              assessmentResponseId: response?.id || null,
            },
            {
              id: mitigation.id,
            }
          );
        })
      );

      // Update deleted at of duplicated due diligence production places
      const duplicatePlaceIds = [];
      for (const id in productionPlaceGroupByParentId) {
        const latest = latestProductionPlace[id];
        const places = productionPlaceGroupByParentId[id];
        for (const place of places) {
          if (place.id != latest.id) duplicatePlaceIds.push(place.id);
        }
      }
      await queryInterface.bulkUpdate(
        'due_diligence_production_places',
        {
          deletedAt: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
        },
        {
          id: { [Op.in]: duplicatePlaceIds },
        }
      );

      // Add taggables to assessment production place
      const assessmentUploadPlaceArray = await queryInterface.sequelize.query(
        `
          SELECT au.id as uploadId, app.id as assessmentPlaceId FROM assessment_uploads au
          INNER JOIN assessment_production_place app
          ON au.production_place_id = app.productionPlaceId AND au.assessment_id = app.assessmentId
        `,
        {
          type: QueryTypes.SELECT,
        }
      );
      await Promise.all(
        assessmentUploadPlaceArray.map((item) => {
          return queryInterface.bulkUpdate(
            'assessment_production_place',
            {
              taggableType: 'uploads',
              taggableId: item.uploadId,
            },
            {
              id: item.assessmentPlaceId,
            }
          );
        })
      );
      const assessmentSurveyPlaceArray = await queryInterface.sequelize.query(
        `
          SELECT a.id as surveyId, app.id as assessmentPlaceId FROM assessment_surveys a
          INNER JOIN assessment_production_place app
          ON a.farm_id = app.productionPlaceId AND a.assessment_id = app.assessmentId
        `,
        {
          type: QueryTypes.SELECT,
        }
      );
      await Promise.all(
        assessmentSurveyPlaceArray.map((item) => {
          return queryInterface.bulkUpdate(
            'assessment_production_place',
            {
              taggableType: 'surveys',
              taggableId: item.surveyId,
            },
            {
              id: item.assessmentPlaceId,
            }
          );
        })
      );

      // Attach report place to assessment production place
      const assessmentProductionPlaces = await queryInterface.sequelize.query(
        `
          SELECT id, productionPlaceId, diligenceReportId FROM assessment_production_place
        `,
        {
          type: QueryTypes.SELECT,
        }
      );
      const reportAssessmentProductionPlaceArray = assessmentProductionPlaces.map((item) => {
        const parentId = Object.keys(productionPlaceGroupByParentId).find((id) =>
          productionPlaceGroupByParentId[id].find((p) => p.id == item.productionPlaceId)
        );
        const latestId = latestProductionPlace[parentId].id;
        const diligenceReportProductionPlace = diligenceReportProductionPlaces.find(
          (place) =>
            place.dueDiligenceProductionPlaceId == latestId && place.diligenceReportId == item.diligenceReportId
        );
        return {
          assessmentProductionPlaceId: item.id,
          diligenceReportProductionPlaceId: diligenceReportProductionPlace.id,
        };
      });
      await queryInterface.bulkInsert(
        'diligence_reports_places_assessment_production_places',
        reportAssessmentProductionPlaceArray
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {},
};
