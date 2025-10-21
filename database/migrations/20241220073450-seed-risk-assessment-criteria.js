'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   const riskAssessmentCriteria = [
      {
        description: "(a) the assignment of risk to the relevant country of production or parts thereof in accordance with Article 29",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "(b) the presence of forests in the country of production or parts thereof",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "(c) the presence of indigenous peoples in the country of production or parts thereof",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "(d) the consultation and cooperation in good faith with indigenous peoples in the country of production or parts thereof",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "(e) the existence of duly reasoned claims by indigenous peoples based on objective and verifiable information regarding the use or ownership of the area used for the purpose of producing the relevant commodity",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "(f) prevalence of deforestation or forest degradation in the country of production or parts thereof",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "(g) the source, reliability, validity, and links to other available documentation of the information referred to in Article 9(1)",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "(h) concerns in relation to the country of production and origin or parts thereof, such as level of corruption, prevalence of document and data falsification, lack of law enforcement, violations of international human rights, armed conflict or presence of sanctions imposed by the UN Security Council or the Council of the European Union",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "(i) the complexity of the relevant supply chain and the stage of processing of the relevant products, in particular difficulties in connecting relevant products to the plot of land where the relevant commodities were produced",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "(j) the risk of circumvention of this Regulation or of mixing with relevant products of unknown origin or produced in areas where deforestation or forest degradation has occurred or is occurring",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "(k) conclusions of the meetings of the Commission expert groups supporting the implementation of this Regulation, as published in the Commission's expert group register",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "(l) substantiated concerns submitted under Article 31, and information on the history of non-compliance of operators or traders along the relevant supply chain with this Regulation.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "(m) any information that would point to a risk that the relevant products are non-compliant",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        description: "(n) complementary information on compliance with this Regulation, which may include information supplied by certification or other third-party verified schemes, including voluntary schemes recognised by the Commission under Article 30(5) of Directive(EU) 2018/2001 of the European Parliament and of the Council (21), provided that the information meets the requirements set out in Article 9 of this Regulation.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      
   ]
    
    try {
      await queryInterface.bulkInsert('risk_assessment_criteria', riskAssessmentCriteria, {});
    } catch (error) {
      console.log(error)
    }
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.bulkDelete('risk_assessment_criteria', null, {});
  }
};
