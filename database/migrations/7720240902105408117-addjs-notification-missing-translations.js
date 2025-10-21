"use strict";

const moment = require("moment");

const languageObjects = [
  {
    "english": "Production place not found.",
    "portugese": "Local de produção não encontrado.",
    "spanish": "Lugar de producción no encontrado.",
    "indonesian": "Tempat produksi tidak ditemukan.",
    "italian": "Luogo di produzione non trovato.",
    "dutch": "Productieplaats niet gevonden.",
    "swahili": "Mahali pa uzalishaji hapapatikani."
  },
  {
    "english": "Successfully updated EUDR deforestation status.",
    "portugese": "Status de desmatamento EUDR atualizado com sucesso.",
    "spanish": "Estado de deforestación EUDR actualizado con éxito.",
    "indonesian": "Berhasil memperbarui status deforestasi EUDR.",
    "italian": "Stato della deforestazione EUDR aggiornato con successo.",
    "dutch": "De EUDR-ontbossingsstatus is met succes bijgewerkt.",
    "swahili": "Imefaulu kusasisha hali ya ukataji miti wa EUDR."
  },
  {
    "english": "Farm data has been successfully uploaded. Tap here to review.",
    "portugese": "Os dados da fazenda foram carregados com sucesso. Toque aqui para revisar.",
    "spanish": "Los datos de la granja se han cargado correctamente. Toque aquí para revisar.",
    "indonesian": "Data peternakan telah berhasil diunggah. Ketuk di sini untuk meninjau.",
    "italian": "I dati dell'azienda agricola sono stati caricati con successo. Tocca qui per rivedere.",
    "dutch": "Bedrijfsgegevens zijn succesvol geüpload. Tik hier om te beoordelen.",
    "swahili": "Data ya shamba imepakiwa kwa ufanisi. Gonga hapa ili ukague."
  },
  {
    "english": "No overlaps detected.",
    "portugese": "Nenhuma sobreposição detectada.",
    "spanish": "No se detectaron superposiciones.",
    "indonesian": "Tidak ada tumpang tindih yang terdeteksi.",
    "italian": "Nessuna sovrapposizione rilevata.",
    "dutch": "Geen overlappingen gedetecteerd.",
    "swahili": "Hakuna mwingiliano uliogunduliwa."
  },
  {
    "english": "Overlap detected between",
    "portugese": "Sobreposição detectada entre",
    "spanish": "Superposición detectada entre",
    "indonesian": "Tumpang tindih terdeteksi antara",
    "italian": "Rilevata sovrapposizione tra",
    "dutch": "Overlapping gedetecteerd tussen",
    "swahili": "Muingiliano umegunduliwa kati ya"
  },
  {
    "english": "Dispute Creation Alert",
    "portugese": "Alerta de criação de disputa",
    "spanish": "Alerta de creación de disputas",
    "indonesian": "Peringatan Penciptaan Sengketa",
    "italian": "Avviso sulla creazione di controversie",
    "dutch": "Waarschuwing voor het ontstaan ​​van geschillen",
    "swahili": "Tahadhari ya Uundaji wa Migogoro"
  },
  {
    "english": "A new dispute has been initiated  by the user. Please review the details and take the necessary action.",
    "portugese": "Uma nova disputa foi iniciada pelo usuário. Revise os detalhes e tome as medidas necessárias.",
    "spanish": "El usuario ha iniciado una nueva disputa. Revise los detalles y tome las medidas necesarias.",
    "indonesian": "Sengketa baru telah dimulai oleh pengguna. Harap tinjau detailnya dan ambil tindakan yang diperlukan.",
    "italian": "L'utente ha avviato una nuova controversia. Si prega di rivedere i dettagli e intraprendere le azioni necessarie.",
    "dutch": "Er is een nieuw geschil gestart door de gebruiker. Controleer de details en onderneem de nodige actie.",
    "swahili": "Mzozo mpya umeanzishwa na mtumiaji. Tafadhali kagua maelezo na uchukue hatua inayofaa."
  },
  {
    "english": "Dispute Closed Alert",
    "portugese": "Alerta de disputa encerrada",
    "spanish": "Alerta de disputa cerrada",
    "indonesian": "Peringatan Tertutup Sengketa",
    "italian": "Avviso di controversia chiusa",
    "dutch": "Geschil gesloten waarschuwing",
    "swahili": "Tahadhari Iliyofungwa ya Mzozo"
  },
  {
    "english": "A new dispute has been closed  by the user. Please review the details and take the necessary action.",
    "portugese": "Uma nova disputa foi encerrada pelo usuário. Revise os detalhes e tome as medidas necessárias.",
    "spanish": "El usuario ha cerrado una nueva disputa. Revise los detalles y tome las medidas necesarias.",
    "indonesian": "Sengketa baru telah ditutup oleh pengguna. Harap tinjau detailnya dan ambil tindakan yang diperlukan.",
    "italian": "Una nuova controversia è stata chiusa dall'utente. Si prega di rivedere i dettagli e intraprendere le azioni necessarie.",
    "dutch": "Er is een nieuw geschil gesloten door de gebruiker. Controleer de details en onderneem de nodige actie.",
    "swahili": "Mzozo mpya umefungwa na mtumiaji. Tafadhali kagua maelezo na uchukue hatua inayofaa."
  },
  {
    "english": "Dispute Info Required Alert",
    "portugese": "Alerta de informações de disputa obrigatórias",
    "spanish": "Alerta de información requerida sobre la disputa",
    "indonesian": "Info Sengketa Diperlukan Peringatan",
    "italian": "Avviso relativo alle informazioni sulla controversia richieste",
    "dutch": "Geschilinformatie vereist waarschuwing",
    "swahili": "Arifa ya Mzozo Inahitajika"
  },
  {
    "english": "A new dispute info request been initiated  by the user. Please review the details and take the necessary action.",
    "portugese": "Uma nova solicitação de informações de disputa foi iniciada pelo usuário. Revise os detalhes e tome as medidas necessárias.",
    "spanish": "El usuario inició una nueva solicitud de información de disputa. Revise los detalles y tome las medidas necesarias.",
    "indonesian": "Permintaan info perselisihan baru telah dimulai oleh pengguna. Harap tinjau detailnya dan ambil tindakan yang diperlukan.",
    "italian": "L'utente ha avviato una nuova richiesta di informazioni sulla controversia. Si prega di rivedere i dettagli e intraprendere le azioni necessarie.",
    "dutch": "Er is een nieuw verzoek om geschilinformatie gestart door de gebruiker. Controleer de details en onderneem de nodige actie.",
    "swahili": "Ombi jipya la maelezo ya mzozo limeanzishwa na mtumiaji. Tafadhali kagua maelezo na uchukue hatua inayofaa."
  },
  {
    "english": "Successfully updated risk assessment status.",
    "portugese": "Status da avaliação de risco atualizado com sucesso.",
    "spanish": "Estado de evaluación de riesgos actualizado correctamente.",
    "indonesian": "Status penilaian risiko berhasil diperbarui.",
    "italian": "Stato della valutazione del rischio aggiornato correttamente.",
    "dutch": "Risicobeoordelingsstatus bijgewerkt.",
    "swahili": "Imefaulu kusasisha hali ya tathmini ya hatari."
  },
  {
    "english": "Failed to update risk assessment status.",
    "portugese": "Falha ao atualizar o status da avaliação de risco.",
    "spanish": "No se pudo actualizar el estado de la evaluación de riesgos.",
    "indonesian": "Gagal memperbarui status penilaian risiko.",
    "italian": "Impossibile aggiornare lo stato della valutazione del rischio.",
    "dutch": "Kan de status van de risicobeoordeling niet bijwerken.",
    "swahili": "Imeshindwa kusasisha hali ya tathmini ya hatari."
  },
  {
    "english": "Successfully imported production place.",
    "portugese": "Local de produção importado com sucesso.",
    "spanish": "Lugar de producción importado con éxito.",
    "indonesian": "Tempat produksi berhasil diimpor.",
    "italian": "Luogo di produzione importato con successo.",
    "dutch": "Productieplaats geïmporteerd.",
    "swahili": "Imefaulu kuleta mahali pa uzalishaji."
  },
  {
    "english": "Dispute deleted successfully",
    "portugese": "Disputa excluída com sucesso",
    "spanish": "Disputa eliminada correctamente",
    "indonesian": "Sengketa berhasil dihapus",
    "italian": "Contestazione eliminata correttamente",
    "dutch": "Geschil is succesvol verwijderd",
    "swahili": "Mzozo umefutwa"
  },
  {
    "english": "Dispute is not expired yet.",
    "portugese": "A disputa ainda não expirou.",
    "spanish": "La disputa aún no ha caducado.",
    "indonesian": "Sengketa belum berakhir.",
    "italian": "La controversia non è ancora scaduta.",
    "dutch": "Het geschil is nog niet verlopen.",
    "swahili": "Mzozo haujaisha muda wake."
  },
  {
    "english": "Failed to create geofence",
    "portugese": "Falha ao criar cerca geográfica",
    "spanish": "No se pudo crear la geocerca",
    "indonesian": "Gagal membuat pembatasan wilayah",
    "italian": "Impossibile creare il recinto virtuale",
    "dutch": "Kan geofence niet maken",
    "swahili": "Imeshindwa kuunda geofence"
  },
  {
    "english": "Risk mitigated manually for high risk farms",
    "portugese": "Risco mitigado manualmente para fazendas de alto risco",
    "spanish": "Riesgo mitigado manualmente para granjas de alto riesgo",
    "indonesian": "Risiko dimitigasi secara manual untuk peternakan berisiko tinggi",
    "italian": "Rischio mitigato manualmente per le aziende agricole ad alto rischio",
    "dutch": "Risico handmatig beperkt voor bedrijven met een hoog risico",
    "swahili": "Hatari imepunguzwa kwa mikono kwa mashamba yenye hatari kubwa"
  },
  {
    "english": "farms restored.",
    "portugese": "fazendas restauradas.",
    "spanish": "fincas restauradas.",
    "indonesian": "peternakan dipulihkan.",
    "italian": "fattorie restaurate.",
    "dutch": "boerderijen hersteld.",
    "swahili": "mashamba kurejeshwa."
  },
  {
    "english": "Farm removed successfully",
    "portugese": "Fazenda removida com sucesso",
    "spanish": "Granja eliminada con éxito",
    "indonesian": "Peternakan berhasil dihapus",
    "italian": "Fattoria rimossa con successo",
    "dutch": "Boerderij succesvol verwijderd",
    "swahili": "Shamba limeondolewa"
  },
  {
    "english": "No farms found to remove",
    "portugese": "Nenhuma fazenda encontrada para remover",
    "spanish": "No se encontraron granjas para eliminar",
    "indonesian": "Tidak ada peternakan yang ditemukan untuk dihapus",
    "italian": "Nessuna fattoria trovata da rimuovere",
    "dutch": "Geen boerderijen gevonden om te verwijderen",
    "swahili": "Hakuna mashamba yaliyopatikana ya kuondoa"
  },
  {
    "english": "File removed successfully.",
    "portugese": "Arquivo removido com sucesso.",
    "spanish": "Archivo eliminado exitosamente.",
    "indonesian": "File berhasil dihapus.",
    "italian": "File rimosso con successo.",
    "dutch": "Bestand succesvol verwijderd.",
    "swahili": "Faili imeondolewa."
  },
  {
    "english": "File not found or already deleted.",
    "portugese": "Arquivo não encontrado ou já excluído.",
    "spanish": "Archivo no encontrado o ya eliminado.",
    "indonesian": "File tidak ditemukan atau sudah dihapus.",
    "italian": "File non trovato o già eliminato.",
    "dutch": "Bestand niet gevonden of al verwijderd.",
    "swahili": "Faili haijapatikana au tayari imefutwa."
  },
  {
    "english": "Production place not found.",
    "portugese": "Local de produção não encontrado.",
    "spanish": "Lugar de producción no encontrado.",
    "indonesian": "Tempat produksi tidak ditemukan.",
    "italian": "Luogo di produzione non trovato.",
    "dutch": "Productieplaats niet gevonden.",
    "swahili": "Mahali pa uzalishaji hapapatikani."
  },
  {
    "english": "Risk mitigated manually.",
    "portugese": "Risco mitigado manualmente.",
    "spanish": "Riesgo mitigado manualmente.",
    "indonesian": "Risiko dimitigasi secara manual.",
    "italian": "Rischio mitigato manualmente.",
    "dutch": "Risico handmatig beperkt.",
    "swahili": "Hatari imepunguzwa kwa mikono."
  },
  {
    "english": "Successfully imported production place.",
    "portugese": "Local de produção importado com sucesso.",
    "spanish": "Lugar de producción importado con éxito.",
    "indonesian": "Tempat produksi berhasil diimpor.",
    "italian": "Luogo di produzione importato con successo.",
    "dutch": "Productieplaats geïmporteerd.",
    "swahili": "Imefaulu kuleta mahali pa uzalishaji."
  },
  {
    "english": "Shapefile components not found",
    "portugese": "Componentes do Shapefile não encontrados",
    "spanish": "Componentes de Shapefile no encontrados",
    "indonesian": "Komponen Shapefile tidak ditemukan",
    "italian": "Componenti del file shape non trovati",
    "dutch": "Shapefile-componenten niet gevonden",
    "swahili": "Vipengele vya faili za umbo hazipatikani"
  },
  {
    "english": "Successfully updated the production places.",
    "portugese": "Atualizados com sucesso os locais de produção.",
    "spanish": "Se actualizaron exitosamente los lugares de producción.",
    "indonesian": "Berhasil memperbarui tempat produksi.",
    "italian": "Aggiornati con successo i luoghi di produzione.",
    "dutch": "De productieplaatsen zijn succesvol bijgewerkt.",
    "swahili": "Imefaulu kusasisha maeneo ya uzalishaji."
  },
  {
    "english": "Successfully created production place.",
    "portugese": "Local de produção criado com sucesso.",
    "spanish": "Lugar de producción creado con éxito.",
    "indonesian": "Tempat produksi berhasil dibuat.",
    "italian": "Luogo di produzione creato con successo.",
    "dutch": "Succesvolle productieplaats gecreëerd.",
    "swahili": "Imefaulu kuunda mahali pa uzalishaji."
  },
  {
    "english": "Diligence Report not found.",
    "portugese": "Relatório de diligência não encontrado.",
    "spanish": "Informe de diligencia no encontrado.",
    "indonesian": "Laporan Ketekunan tidak ditemukan.",
    "italian": "Rapporto di diligenza non trovato.",
    "dutch": "Diligence-rapport niet gevonden.",
    "swahili": "Ripoti ya Diligence haijapatikana."
  },
  {
    "english": "Deforestation Report Generated",
    "portugese": "Relatório de desmatamento gerado",
    "spanish": "Informe de deforestación generado",
    "indonesian": "Laporan Deforestasi Dihasilkan",
    "italian": "Generato il rapporto sulla deforestazione",
    "dutch": "Ontbossingrapport gegenereerd",
    "swahili": "Ripoti ya Ukataji miti Imetolewa"
  },
  {
    "english": "Deforestation report generate. Tap here to review.",
    "portugese": "Relatório de desmatamento gerado. Toque aqui para revisar.",
    "spanish": "Generar informe de deforestación. Toque aquí para revisar.",
    "indonesian": "Laporan deforestasi dihasilkan. Ketuk di sini untuk meninjau.",
    "italian": "Generazione del rapporto sulla deforestazione. Tocca qui per rivedere.",
    "dutch": "Ontbossingrapport genereren. Tik hier om te beoordelen.",
    "swahili": "Ripoti ya ukataji miti. Gonga hapa ili ukague."
  },
  {
    "english": "Deforestation report generate. Tap here to review.",
    "portugese": "Relatório de desmatamento gerado. Toque aqui para revisar.",
    "spanish": "Generar informe de deforestación. Toque aquí para revisar.",
    "indonesian": "Laporan deforestasi dihasilkan. Ketuk di sini untuk meninjau.",
    "italian": "Generazione del rapporto sulla deforestazione. Tocca qui per rivedere.",
    "dutch": "Ontbossingrapport genereren. Tik hier om te beoordelen.",
    "swahili": "Ripoti ya ukataji miti. Gonga hapa ili ukague."
  },
  {
    "english": "months ago",
    "portugese": "meses antes",
    "spanish": "Hace meses",
    "indonesian": "bulan yang lalu",
    "italian": "mesi fa",
    "dutch": "maanden geleden",
    "swahili": "miezi iliyopita"
  },
  {
    "english": "days ago",
    "portugese": "dias atrás",
    "spanish": "hace dias",
    "indonesian": "beberapa hari yang lalu",
    "italian": "giorni fa",
    "dutch": "dagen geleden",
    "swahili": "siku zilizopita"
  },
  {
    "english": "year ago",
    "portugese": "ano atrás",
    "spanish": "hace un año",
    "indonesian": "tahun yang lalu",
    "italian": "anno fa",
    "dutch": "jaar geleden",
    "swahili": "mwaka uliopita"
  },
  {
    "english": "Farm data has been successfully uploaded. Tap here to review.\r",
    "portugese": "Os dados da fazenda foram carregados com sucesso. Toque aqui para revisar.\r",
    "spanish": "Los datos de la granja se han cargado correctamente. Toque aquí para revisar.\r",
    "indonesian": "Data peternakan telah berhasil diunggah. Ketuk di sini untuk meninjau.\r",
    "italian": "I dati dell'azienda agricola sono stati caricati con successo. Tocca qui per rivedere.\r",
    "dutch": "Bedrijfsgegevens zijn succesvol geüpload. Tik hier om te beoordelen.\r",
    "swahili": "Data ya shamba imepakiwa kwa ufanisi. Gonga hapa ili ukague.\r"
  }
]

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      for (const row of languageObjects) {
        let sql =
          "SELECT * FROM global_translation_metadata WHERE english = :english";
        const global_trans = await queryInterface.sequelize.query(sql, {
          type: Sequelize.QueryTypes.SELECT,
          replacements: { english: row.english },
        });

        // update case
        if (global_trans && global_trans.length > 0) {
          let item = {};
          for (let key in row) {
            const language = key.toLowerCase().trim();
            item[language] = row[key];
          }
          await queryInterface.bulkUpdate("global_translation_metadata", item, {
            id: global_trans?.map(item => item.id)
          });
        }
        // insert case
        else {
          let item = {};
          for (let key in row) {
            const language = key.toLowerCase().trim();
            item[language] = row[key] != null ? row[key] : ''; // Default to an empty string
          }
          await queryInterface.bulkInsert("global_translation_metadata", [item]);
        }
      }
    } catch (err) {
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    for (const obj of languageObjects) {
      await queryInterface.bulkDelete(
        "global_translation_metadata",
        { english: obj.english },
        {},
        {}
      );
    }
  },
};