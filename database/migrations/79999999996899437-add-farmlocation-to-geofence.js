module.exports = {
  async up(queryInterface, Sequelize) {


    await queryInterface.addColumn("geofences", "farmLocationId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {

  },
};
