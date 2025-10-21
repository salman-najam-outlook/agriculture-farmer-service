'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('document_codes', [
      {
        documentCode: 'C716',
        title: 'Compliance',
        description: 'Use this document code for products that fall under the Regulation and for which a Due Diligence Statement must be available upon import and export. See Article 3 of the Regulation.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        documentCode: 'C717',
        title: 'Resubmission',
        description: 'Use this document code as an SME if a due diligence statement has already been submitted for your products. In addition to this document code, you must also state the reference number of that previously submitted statement in your declaration. See Article 4, paragraph 8 of the Regulation.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        documentCode: 'Y219',
        title: 'Exemption',
        description: 'Use this document code for products that are exempted via the ex codes in Annex I of the Regulation and are not covered by the Regulation.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        documentCode: 'Y132',
        title: 'Legacy',
        description: 'Use this document code for products that fall under Annex I of the Regulation, but that were produced before 29 June 2023 and to which the Regulation therefore does not apply. See also Article 1(2) and Article 38(1) of the Regulation.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        documentCode: 'Y133',
        title: 'Recycling',
        description: 'Use this document code for products that are not covered by the EUDR because they are made from materials that have completed their life cycle and whose materials would have been considered waste if they had not been used in your production process. An exception to this are by-products from the production process, where materials were used in the production process that would not be considered waste within the meaning of Article 3(1) of Directive 2008/98/EC.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        documentCode: 'Y141',
        title: 'SME Deferral',
        description: 'Use this declaration code if you are an SME or sole proprietorship (as referred to in Article 2, paragraph 30 of the Regulation). The Regulation will enter into force for you on 30 June 2025. The 6-month deferral only applies to SMEs and sole proprietorships that were registered with the Chamber of Commerce no later than 31 December 2020. See Article 38, paragraphs 2 and 3 of the Regulation. Was your SME or sole proprietorship established after 31 December 2020? Then the Regulation will enter into force for you from 30 December 2024. This deferral does not apply to micro-enterprises and SMEs that already trade in wood. See Article 38, paragraph 3 of the Regulation',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        documentCode: 'Y142',
        title: 'Non-Commercial',
        description: 'Use this declaration code when you file a return for non-commercial activities. These activities are exempt and do not fall under the regulation.',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('document_codes', null, {});
  }
};
