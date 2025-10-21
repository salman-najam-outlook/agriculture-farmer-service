module.exports = {
  up: async (queryInterface, Sequelize) => {
    const translations = [
      {
        "english": "Lieu de production introuvable.",
        "french": "Production place not found."
      },
      {
        "english": "Statut de déforestation EUDR mis à jour avec succès.",
        "french": "Successfully updated EUDR deforestation status."
      },
      {
        "english": "Les données de la ferme ont été téléchargées avec succès. Appuyez ici pour les consulter.",
        "french": "Farm data has been successfully uploaded. Tap here to review."
      },
      {
        "english": "Aucun chevauchement détecté.",
        "french": "No overlaps detected."
      },
      {
        "english": "Chevauchement détecté entre.",
        "french": "Overlap detected between"
      },
      {
        "english": "Alerte de création de litige.",
        "french": "Dispute Creation Alert"
      },
      {
        "english": "Un nouveau litige a été initié par l'utilisateur. Veuillez examiner les détails et prendre les mesures nécessaires.",
        "french": "A new dispute has been initiated  by the user. Please review the details and take the necessary action."
      },
      {
        "english": "Alerte de clôture de litige.",
        "french": "Dispute Closed Alert"
      },
      {
        "english": "Un nouveau litige a été clôturé par l'utilisateur. Veuillez examiner les détails et prendre les mesures nécessaires.",
        "french": "A new dispute has been closed  by the user. Please review the details and take the necessary action."
      },
      {
        "english": "Alerte d'informations requises pour le litige.",
        "french": "Dispute Info Required Alert"
      },
      {
        "english": "Une nouvelle demande d'informations sur un litige a été initiée par l'utilisateur. Veuillez examiner les détails et prendre les mesures nécessaires.",
        "french": "A new dispute info request been initiated  by the user. Please review the details and take the necessary action."
      },
      {
        "english": "Statut de l'évaluation des risques mis à jour avec succès.",
        "french": "Successfully updated risk assessment status."
      },
      {
        "english": "Échec de la mise à jour du statut de l'évaluation des risques.",
        "french": "Failed to update risk assessment status."
      },
      {
        "english": "Lieu de production importé avec succès.",
        "french": "Successfully imported production place."
      },
      {
        "english": "Litige supprimé avec succès.",
        "french": "Dispute deleted successfully"
      },
      {
        "english": "Le litige n'a pas encore expiré.",
        "french": "Dispute is not expired yet."
      },
      {
        "english": "Échec de la création de la zone géographique.",
        "french": "Failed to create geofence"
      },
      {
        "english": "Risque atténué manuellement pour les fermes à haut risque.",
        "french": "Risk mitigated manually for high risk farms"
      },
      {
        "english": "Fermes restaurées.",
        "french": "farms restored."
      },
      {
        "english": "Ferme supprimée avec succès.",
        "french": "Farm removed successfully"
      },
      {
        "english": "Aucune ferme trouvée à supprimer.",
        "french": "No farms found to remove"
      },
      {
        "english": "Fichier supprimé avec succès.",
        "french": "File removed successfully."
      },
      {
        "english": "Fichier introuvable ou déjà supprimé.",
        "french": "File not found or already deleted."
      },
      {
        "english": "Risque atténué manuellement.",
        "french": "Risk mitigated manually."
      },
      {
        "english": "Composants du fichier de forme introuvables.",
        "french": "Shapefile components not found"
      },
      {
        "english": "Lieux de production mis à jour avec succès.",
        "french": "Successfully updated the production places."
      },
      {
        "english": "Lieu de production créé avec succès.",
        "french": "Successfully created production place."
      },
      {
        "english": "Rapport de diligence introuvable.",
        "french": "Diligence Report not found."
      },
      {
        "english": "Rapport de déforestation généré.",
        "french": "Deforestation Report Generated"
      },
      {
        "english": "Rapport de déforestation généré. Appuyez ici pour le consulter.",
        "french": "Deforestation report generate. Tap here to review."
      },
      {
        "english": "il y a des mois.",
        "french": "months ago"
      },
      {
        "english": "il y a des jours.",
        "french": "days ago"
      },
      {
        "english": "il y a un an.",
        "french": "year ago"
      },
      {
        "english": "Les données de la ferme ont été téléchargées avec succès. Appuyez ici pour les consulter.\r",
        "french": "Farm data has been successfully uploaded. Tap here to review.\r"
      }
    ]

    try {
      const records = await queryInterface.sequelize.query(
        "SELECT id, english FROM global_translation_metadata WHERE french IS NULL",
        { type: Sequelize.QueryTypes.SELECT }
      );

      const translationMap = new Map(
        translations.map((t) => [t.english, t.french])
      );

      for (const record of records) {
        const frenchTranslation = translationMap.get(record.english);
        if (frenchTranslation) {
          await queryInterface.bulkUpdate(
            "global_translation_metadata",
            { french: frenchTranslation },
            { id: record.id }
          );
        }
      }

    } catch (error) {
      console.error("Error updating French translations:", error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      for (const translation of translations) {
        await queryInterface.bulkUpdate(
          "global_translation_metadata",
          { french: null },
          { english: translation.english }
        );
      }
    } catch (error) {
      console.error("Error rolling back French translations:", error);
      throw error;
    }
  }
};
