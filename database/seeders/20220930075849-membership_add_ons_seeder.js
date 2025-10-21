'use strict';


let membershipData = [ 
  {membership_name: "Free Trial", description: "Free Trial" },
  {membership_name: "Basic Plan", description: "Basic Plan" },
  {membership_name: "Enterprise", description: "Premium membership" },
  {membership_name: "Fedepanela Trial", description: "Fedepanela trial membership" },
]

let addOnData = [
   {id: 1, name: 'Satellite Add-On', add_on_details: JSON.stringify([{addon_type: '16 Reports Weekly'}, {addon_type: 'Dairy Management'}]), per_month_fee: 4, per_year_fee :45 },
   {id: 2, name: 'Dairy Managment Add-On', add_on_details: JSON.stringify([{addon_type: '16 Reports Weekly'}, {addon_type: 'Dairy Management'}]), per_month_fee: 4, per_year_fee :45 },

   {id: 3, name: 'Marketplace Add-On', add_on_details: JSON.stringify([{addon_type: 'Free for all users'}, {addon_type: 'Dairy Management'}]), per_month_fee: 4, per_year_fee :45 },
   {id: 4, name: 'Semen Automation Add-On', add_on_details: JSON.stringify([{addon_type: '20 Lorem Ipsum dummy text'}, {addon_type: 'Dairy Management'}]), per_month_fee: 4, per_year_fee :45 }
]

let membershipFeeData = [
  {membership_id: 1, per_month_fee: 4, per_year_fee :45 },
  {membership_id: 2, per_month_fee: 4, per_year_fee :45 },
  {membership_id: 3,  per_month_fee: 4, per_year_fee :45 },
]

module.exports = {
  async up (queryInterface, Sequelize) {

     await queryInterface.bulkInsert('memberships', membershipData, {});
     await queryInterface.bulkInsert('add_ons', addOnData, {});
     await queryInterface.bulkInsert('membership_fees', membershipFeeData, {});

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('membership_add_ons_map', null, {});
    await queryInterface.bulkDelete('membership_fees', null, {});
    await queryInterface.bulkDelete('memberships', null, {});
    await queryInterface.bulkDelete('add_ons', null, {});
  }
};
