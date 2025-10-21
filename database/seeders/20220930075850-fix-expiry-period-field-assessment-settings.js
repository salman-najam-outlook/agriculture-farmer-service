'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const assessmentSettings = await queryInterface.sequelize.query(`
      SELECT settings.id, settings.expiry_date, assessments.createdAt
      FROM assessment_settings AS settings 
      INNER JOIN assessments
      ON settings.assessment_id = assessments.id
    `);
    
    for await (const setting of assessmentSettings[0]) {
      if (setting.expiryDate === "" || setting.expiryDate === null) continue;
      
      const expiryDate = new Date(setting.expiry_date);
      const createdAt = new Date(setting.createdAt);

      if (createdAt > expiryDate) continue;

      const differenceInMS = expiryDate - createdAt;
      
      await queryInterface.sequelize.query(`
        UPDATE assessment_settings
        SET expiry_period = '${differenceInMS}'
        WHERE id = ${setting.id}  
      `);
    }
  },

  async down (queryInterface, Sequelize) {
    
  }
};
