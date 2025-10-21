module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      "global_translation_metadata",
      "english",
      {
        type: Sequelize.TEXT("long"),
      }
    );
    await queryInterface.changeColumn(
      "global_translation_metadata",
      "spanish",
      {
        type: Sequelize.TEXT("long"),
      }
    );
    await queryInterface.changeColumn(
      "global_translation_metadata",
      "portugese",
      {
        type: Sequelize.TEXT("long"),
      }
    );
    await queryInterface.changeColumn(
      "global_translation_metadata",
      "indonesian",
      {
        type: Sequelize.TEXT("long"),
      }
    );
    await queryInterface.changeColumn(
      "global_translation_metadata",
      "italian",
      {
        type: Sequelize.TEXT("long"),
      }
    );
    await queryInterface.changeColumn("global_translation_metadata", "dutch", {
      type: Sequelize.TEXT("long"),
    });
    await queryInterface.changeColumn(
      "global_translation_metadata",
      "swahili",
      {
        type: Sequelize.TEXT("long"),
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      "global_translation_metadata",
      "english",
      {
        type: Sequelize.TEXT,
      }
    );
    await queryInterface.changeColumn(
      "global_translation_metadata",
      "spanish",
      {
        type: Sequelize.TEXT,
      }
    );
    await queryInterface.changeColumn(
      "global_translation_metadata",
      "portugese",
      {
        type: Sequelize.TEXT,
      }
    );
    await queryInterface.changeColumn(
      "global_translation_metadata",
      "indonesian",
      {
        type: Sequelize.TEXT,
      }
    );
    await queryInterface.changeColumn(
      "global_translation_metadata",
      "italian",
      {
        type: Sequelize.TEXT,
      }
    );
    await queryInterface.changeColumn("global_translation_metadata", "dutch", {
      type: Sequelize.TEXT,
    });
    await queryInterface.changeColumn(
      "global_translation_metadata",
      "swahili",
      {
        type: Sequelize.TEXT,
      }
    );
  },
};
