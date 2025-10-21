"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
      const translationData = [
        {
          english:
            "(a) the assignment of risk to the relevant country of production or parts thereof in accordance with Article 29",
          portugese:
            "a) A atribuição do risco ao país de produção relevante ou a partes do mesmo, em conformidade com o artigo 29.º",
          spanish:
            "a) la asignación del riesgo al país de producción correspondiente o a partes del mismo de conformidad con el artículo 29",
          indonesian:
            "(a) pengalihan risiko ke negara produksi atau bagiannya yang relevan sesuai dengan Pasal 29",
          italian:
            "a) l'assegnazione del rischio al paese di produzione interessato o a parti di esso conformemente all'articolo 29",
          dutch:
            "a) de toewijzing van risico's aan het relevante land van productie of delen daarvan overeenkomstig artikel 29",
          swahili:
            "(a) ugawaji wa hatari kwa nchi husika ya uzalishaji au sehemu zake kwa mujibu wa Kifungu cha 29",
        },
        {
          english:
            "(b) the presence of forests in the country of production or parts thereof",
          portugese:
            "(b) a presença de florestas no país de produção ou em partes dele",
          spanish:
            "(b) la presencia de bosques en el país de producción o partes del mismo",
          indonesian:
            "(b) keberadaan hutan di negara produksi atau bagian-bagiannya",
          italian:
            "(b) la presenza di foreste nel paese di produzione o parti di esse",
          dutch:
            "b) de aanwezigheid van bossen in het land van productie of delen daarvan",
          swahili:
            "(b) uwepo wa misitu katika nchi ya uzalishaji au sehemu zake",
        },
        {
          english:
            "(c) the presence of indigenous peoples in the country of production or parts thereof",
          portugese:
            "(c) a presença de povos indígenas no país de produção ou em partes dele",
          spanish:
            "(c) la presencia de pueblos indígenas en el país de producción o partes del mismo",
          indonesian:
            "(c) keberadaan masyarakat adat di negara produksi atau bagiannya",
          italian:
            "c) la presenza di popolazioni indigene nel paese di produzione o in parti di esso",
          dutch:
            "c) de aanwezigheid van inheemse volkeren in het productieland of delen daarvan",
          swahili:
            "(c) uwepo wa watu wa kiasili katika nchi ya uzalishaji au sehemu zake",
        },
        {
          english:
            "(d) the consultation and cooperation in good faith with indigenous peoples in the country of production or parts thereof",
          portugese:
            "(d) a consulta e cooperação de boa fé com os povos indígenas no país de produção ou partes dele",
          spanish:
            "(d) la consulta y cooperación de buena fe con los pueblos indígenas en el país de producción o partes del mismo",
          indonesian:
            "(d) konsultasi dan kerja sama dengan itikad baik dengan masyarakat adat di negara tempat produksi atau bagiannya",
          italian:
            "d) la consultazione e la cooperazione in buona fede con le popolazioni indigene nel paese di produzione o in parti di esso",
          dutch:
            "(d) het overleg en de samenwerking te goeder trouw met inheemse volkeren in het productieland of delen daarvan",
          swahili:
            "(d) mashauriano na ushirikiano kwa nia njema na watu wa kiasili katika nchi ya uzalishaji au sehemu zake",
        },
        {
          english:
            "(e) the existence of duly reasoned claims by indigenous peoples based on objective and verifiable information regarding the use or ownership of the area used for the purpose of producing the relevant commodity",
          portugese:
            "(e) a existência de reivindicações devidamente fundamentadas por parte dos povos indígenas com base em informações objetivas e verificáveis ​​sobre o uso ou propriedade da área utilizada para fins de produção do produto em questão",
          spanish:
            "(e) la existencia de reclamaciones debidamente motivadas por parte de los pueblos indígenas basadas en información objetiva y verificable sobre el uso o la propiedad del área utilizada con el fin de producir el producto básico correspondiente",
          indonesian:
            "(e) adanya klaim yang beralasan dari masyarakat adat berdasarkan informasi yang obyektif dan dapat diverifikasi mengenai penggunaan atau kepemilikan wilayah yang digunakan untuk tujuan produksi komoditas terkait.",
          italian:
            "(e) l'esistenza di rivendicazioni debitamente motivate da parte delle popolazioni indigene basate su informazioni oggettive e verificabili riguardanti l'uso o la proprietà dell'area utilizzata allo scopo di produrre il bene in questione",
          dutch:
            "(e) het bestaan ​​van naar behoren gemotiveerde claims van inheemse volkeren, gebaseerd op objectieve en verifieerbare informatie over het gebruik of eigendom van het gebied dat wordt gebruikt voor de productie van de betreffende grondstof",
          swahili:
            "(e) kuwepo kwa madai ya watu wa kiasili yenye sababu za msingi kwa msingi wa taarifa zenye lengo na zinazoweza kuthibitishwa kuhusu matumizi au umiliki wa eneo linalotumika kwa madhumuni ya kuzalisha bidhaa husika.",
        },
        {
          english:
            "(f) prevalence of deforestation or forest degradation in the country of production or parts thereof",
          portugese:
            "(f) Prevalência de desmatamento ou degradação florestal no país de produção ou em partes dele",
          spanish:
            "(f) prevalencia de la deforestación o degradación forestal en el país de producción o partes del mismo",
          indonesian:
            "(f) prevalensi deforestasi atau degradasi hutan di negara produksi atau bagiannya",
          italian:
            "f) prevalenza della deforestazione o del degrado forestale nel paese di produzione o in parti di esso",
          dutch:
            "f) de prevalentie van ontbossing of bosdegradatie in het land van productie of delen daarvan",
          swahili:
            "(f) kuenea kwa ukataji miti au uharibifu wa misitu katika nchi ya uzalishaji au sehemu zake",
        },
        {
          english:
            "(g) the source, reliability, validity, and links to other available documentation of the information referred to in Article 9(1)",
          portugese:
            "(g) A fonte, a fiabilidade, a validade e as ligações para outra documentação disponível das informações referidas no artigo 9.º, n.º 1.",
          spanish:
            "g) la fuente, la fiabilidad, la validez y los enlaces a otra documentación disponible de la información a que se refiere el artículo 9, apartado 1",
          indonesian:
            "(g) sumber, keandalan, validitas, dan tautan ke dokumentasi informasi lain yang tersedia sebagaimana dimaksud dalam Pasal 9(1)",
          italian:
            "g) la fonte, l'affidabilità, la validità e i collegamenti ad altra documentazione disponibile delle informazioni di cui all'articolo 9, paragrafo 1.",
          dutch:
            "g) de bron, betrouwbaarheid, validiteit en links naar andere beschikbare documentatie van de in artikel 9, lid 1, bedoelde informatie",
          swahili:
            "(g) chanzo, kutegemewa, uhalali na viungo vya hati nyinginezo zinazopatikana za maelezo yanayorejelewa katika Kifungu cha 9(1)",
        },
        {
          english:
            "(h) concerns in relation to the country of production and origin or parts thereof, such as level of corruption, prevalence of document and data falsification, lack of law enforcement, violations of international human rights, armed conflict or presence of sanctions imposed by the UN Security Council or the Council of the European Union",
          portugese:
            "h) Preocupações relacionadas com o país de produção e de origem ou partes do mesmo, tais como o nível de corrupção, a prevalência da falsificação de documentos e dados, a falta de aplicação da lei, as violações dos direitos humanos internacionais, os conflitos armados ou a presença de sanções impostas pelo Conselho de Segurança da ONU ou Conselho da União Europeia",
          spanish:
            "(h) preocupaciones en relación con el país de producción y origen o partes del mismo, como el nivel de corrupción, la prevalencia de la falsificación de documentos y datos, la falta de aplicación de la ley, las violaciones de los derechos humanos internacionales, los conflictos armados o la presencia de sanciones impuestas por el Consejo de Seguridad de la ONU o Consejo de la Unión Europea",
          indonesian:
            "(h) kekhawatiran terkait dengan negara produksi dan asal atau bagian-bagiannya, seperti tingkat korupsi, maraknya pemalsuan dokumen dan data, kurangnya penegakan hukum, pelanggaran hak asasi manusia internasional, konflik bersenjata atau adanya sanksi yang dikenakan oleh negara tersebut. Dewan Keamanan PBB atau Dewan Uni Eropa",
          italian:
            "(h) preoccupazioni in relazione al paese di produzione e di origine o a parti di esso, come livello di corruzione, prevalenza di falsificazione di documenti e dati, mancanza di applicazione della legge, violazioni dei diritti umani internazionali, conflitto armato o presenza di sanzioni imposte dal Consiglio di Sicurezza dell’ONU o Consiglio dell’Unione Europea",
          dutch:
            "h) zorgen met betrekking tot het land van productie en herkomst of delen daarvan, zoals de mate van corruptie, de prevalentie van vervalsing van documenten en gegevens, gebrek aan wetshandhaving, schendingen van de internationale mensenrechten, gewapende conflicten of de aanwezigheid van sancties opgelegd door de VN-Veiligheidsraad of de Raad van de Europese Unie",
          swahili:
            "(h) masuala yanayohusiana na nchi ya uzalishaji na asili au sehemu zake, kama vile kiwango cha rushwa, kuenea kwa nyaraka na upotoshaji wa data, ukosefu wa utekelezaji wa sheria, ukiukwaji wa haki za kimataifa za binadamu, migogoro ya silaha au uwepo wa vikwazo vilivyowekwa na Baraza la Usalama la Umoja wa Mataifa au Baraza la Umoja wa Ulaya",
        },
        {
          english:
            "(i) the complexity of the relevant supply chain and the stage of processing of the relevant products, in particular difficulties in connecting relevant products to the plot of land where the relevant commodities were produced",
          portugese:
            "(i) a complexidade da cadeia de abastecimento relevante e a fase de transformação dos produtos relevantes, em particular dificuldades na ligação dos produtos relevantes ao terreno onde os produtos relevantes foram produzidos",
          spanish:
            "(i) la complejidad de la cadena de suministro relevante y la etapa de procesamiento de los productos relevantes, en particular las dificultades para conectar los productos relevantes con la parcela de tierra donde se produjeron los productos básicos relevantes",
          indonesian:
            "(i) kompleksitas rantai pasok yang relevan dan tahap pengolahan produk yang relevan, khususnya kesulitan dalam menghubungkan produk yang relevan dengan lahan dimana komoditas terkait diproduksi",
          italian:
            "(i) la complessità della catena di approvvigionamento interessata e la fase di trasformazione dei prodotti interessati, in particolare le difficoltà nel collegare i prodotti interessati al terreno in cui sono stati prodotti i prodotti interessati",
          dutch:
            "i) de complexiteit van de relevante toeleveringsketen en het stadium van de verwerking van de relevante producten, met name problemen bij het verbinden van relevante producten met het perceel waar de relevante goederen werden geproduceerd",
          swahili:
            "(i) utata wa mnyororo husika wa ugavi na hatua ya usindikaji wa bidhaa husika, hususan ugumu wa kuunganisha bidhaa husika na kiwanja ambapo bidhaa husika zilizalishwa.",
        },
        {
          english:
            "(j) the risk of circumvention of this Regulation or of mixing with relevant products of unknown origin or produced in areas where deforestation or forest degradation has occurred or is occurring",
          portugese:
            "(j) O risco de evasão ao presente regulamento ou de mistura com produtos relevantes de origem desconhecida ou produzidos em áreas onde ocorreu ou está a ocorrer desflorestação ou degradação florestal",
          spanish:
            "j) el riesgo de elusión del presente Reglamento o de mezcla con productos pertinentes de origen desconocido o producidos en zonas donde se ha producido o se está produciendo deforestación o degradación forestal",
          indonesian:
            "(j) risiko pengabaian Peraturan ini atau tercampurnya produk terkait yang tidak diketahui asalnya atau diproduksi di kawasan di mana deforestasi atau degradasi hutan telah terjadi atau sedang terjadi",
          italian:
            "(j) il rischio di elusione del presente regolamento o di mescolamento con prodotti pertinenti di origine sconosciuta o prodotti in aree in cui si è verificata o è in corso la deforestazione o il degrado forestale",
          dutch:
            "j) het risico van omzeiling van deze verordening of van vermenging met relevante producten van onbekende oorsprong of geproduceerd in gebieden waar ontbossing of bosdegradatie heeft plaatsgevonden of plaatsvindt",
          swahili:
            "(j) hatari ya kukiuka Kanuni hii au kuchanganya na mazao husika ya asili isiyojulikana au yanayozalishwa katika maeneo ambayo ukataji miti au uharibifu wa misitu umetokea au unatokea.",
        },
        {
          english:
            "(k) conclusions of the meetings of the Commission expert groups supporting the implementation of this Regulation, as published in the Commission's expert group register",
          portugese:
            "(k) Conclusões das reuniões dos grupos de peritos da Comissão que apoiam a aplicação do presente regulamento, publicadas no registo do grupo de peritos da Comissão",
          spanish:
            "k) conclusiones de las reuniones de los grupos de expertos de la Comisión que apoyan la aplicación del presente Reglamento, publicadas en el registro de grupos de expertos de la Comisión",
          indonesian:
            "(k) kesimpulan rapat kelompok ahli Komisi yang mendukung pelaksanaan Regulasi ini, sebagaimana dimuat dalam daftar kelompok ahli Komisi",
          italian:
            "k) conclusioni delle riunioni dei gruppi di esperti della Commissione a sostegno dell'attuazione del presente regolamento, pubblicate nel registro dei gruppi di esperti della Commissione",
          dutch:
            "k) conclusies van de bijeenkomsten van de deskundigengroepen van de Commissie ter ondersteuning van de uitvoering van deze verordening, zoals gepubliceerd in het deskundigengroepregister van de Commissie",
          swahili:
            "(k) mahitimisho ya mikutano ya makundi ya wataalam wa Tume wanaounga mkono utekelezaji wa Kanuni hii, kama ilivyochapishwa katika rejista ya vikundi vya wataalam wa Tume.",
        },
        {
          english:
            "(l) substantiated concerns submitted under Article 31, and information on the history of non-compliance of operators or traders along the relevant supply chain with this Regulation.",
          portugese:
            "(l) Preocupações fundamentadas apresentadas nos termos do artigo 31.º e informações sobre o historial de incumprimento do presente regulamento pelos operadores ou comerciantes ao longo da cadeia de abastecimento relevante.",
          spanish:
            "l) preocupaciones fundamentadas presentadas con arreglo al artículo 31, e información sobre el historial de incumplimiento del presente Reglamento por parte de los operadores o comerciantes a lo largo de la cadena de suministro pertinente.",
          indonesian:
            "(l) kekhawatiran yang dibuktikan berdasarkan Pasal 31, dan informasi mengenai riwayat ketidakpatuhan operator atau pedagang di sepanjang rantai pasokan terkait terhadap Peraturan ini.",
          italian:
            "(l) preoccupazioni circostanziate presentate a norma dell'articolo 31 e informazioni sui precedenti casi di non conformità degli operatori o dei commercianti lungo la catena di fornitura interessata al presente regolamento.",
          dutch:
            "l) gegronde zorgen die zijn ingediend op grond van artikel 31, en informatie over de geschiedenis van niet-naleving van deze verordening door exploitanten of handelaars in de relevante toeleveringsketen.",
          swahili:
            "(l) ilithibitisha matatizo yaliyowasilishwa chini ya Kifungu cha 31, na maelezo kuhusu historia ya kutotii waendeshaji au wafanyabiashara pamoja na msururu husika wa ugavi na Kanuni hii.",
        },
        {
          english:
            "(m) any information that would point to a risk that the relevant products are non-compliant",
          portugese:
            "(m) qualquer informação que possa apontar para um risco de os produtos relevantes não serem conformes",
          spanish:
            "m) cualquier información que indique un riesgo de que los productos en cuestión no sean conformes",
          indonesian:
            "(m) informasi apa pun yang menunjukkan risiko ketidakpatuhan produk terkait",
          italian:
            "(m) qualsiasi informazione che indichi il rischio che i prodotti in questione non siano conformi",
          dutch:
            "m) alle informatie die zou wijzen op een risico dat de relevante producten niet aan de eisen voldoen",
          swahili:
            "(m) taarifa yoyote ambayo inaweza kuashiria hatari kwamba bidhaa husika hazifuati sheria",
        },
        {
          english:
            "(n) complementary information on compliance with this Regulation, which may include information supplied by certification or other third-party verified schemes, including voluntary schemes recognised by the Commission under Article 30(5) of Directive(EU) 2018/2001 of the European Parliament and of the Council (21), provided that the information meets the requirements set out in Article 9 of this Regulation.",
          portugese:
            "(n) Informações complementares sobre a conformidade com o presente regulamento, que podem incluir informações fornecidas por sistemas de certificação ou outros sistemas verificados por terceiros, incluindo sistemas voluntários reconhecidos pela Comissão nos termos do artigo 30.º, n.º 5, da Diretiva (UE) 2018/2001 da União Europeia Parlamento e do Conselho (21), desde que as informações cumpram os requisitos estabelecidos no artigo 9.o do presente regulamento.",
          spanish:
            "n) información complementaria sobre el cumplimiento del presente Reglamento, que podrá incluir información proporcionada por sistemas de certificación u otros sistemas verificados por terceros, incluidos sistemas voluntarios reconocidos por la Comisión en virtud del artículo 30, apartado 5, de la Directiva (UE) 2018/2001 de la Unión Europea. Parlamento y del Consejo (21), siempre que la información cumpla los requisitos establecidos en el artículo 9 del presente Reglamento.",
          indonesian:
            "(n) informasi pelengkap mengenai kepatuhan terhadap Peraturan ini, yang dapat mencakup informasi yang diberikan oleh sertifikasi atau skema terverifikasi pihak ketiga lainnya, termasuk skema sukarela yang diakui oleh Komisi berdasarkan Pasal 30(5) Directive(EU) 2018/2001 European Parlemen dan Dewan (21), dengan ketentuan bahwa informasi tersebut memenuhi persyaratan yang ditetapkan dalam Pasal 9 Peraturan ini.",
          italian:
            "(n) informazioni complementari sulla conformità al presente regolamento, che possono includere informazioni fornite da sistemi di certificazione o altri sistemi verificati da terzi, compresi i sistemi volontari riconosciuti dalla Commissione ai sensi dell'articolo 30, paragrafo 5, della direttiva (UE) 2018/2001 del Consiglio europeo Parlamento e del Consiglio (21), a condizione che le informazioni soddisfino i requisiti di cui all'articolo 9 del presente regolamento.",
          dutch:
            "n) aanvullende informatie over de naleving van deze verordening, waaronder mogelijk informatie die is verstrekt door certificering of andere door derden geverifieerde systemen, met inbegrip van vrijwillige systemen die door de Commissie zijn erkend op grond van artikel 30, lid 5, van Richtlijn (EU) 2018/2001 van de Europese Commissie. Parlement en de Raad (21), op voorwaarde dat de informatie voldoet aan de vereisten van artikel 9 van deze verordening.",
          swahili:
            "(n) maelezo ya ziada kuhusu utiifu wa Kanuni hii, ambayo inaweza kujumuisha taarifa iliyotolewa na uidhinishaji au mipango mingine iliyothibitishwa na wahusika wengine, ikijumuisha mipango ya hiari inayotambuliwa na Tume chini ya Kifungu cha 30(5) cha Maagizo (EU) 2018/2001 ya Jumuiya ya Ulaya. Bunge na Baraza la (21), mradi maelezo yanakidhi matakwa yaliyoainishwa katika Kifungu cha 9 cha Kanuni hii.",
        },
      ];

      try {
        await queryInterface.bulkInsert('global_translation_metadata', translationData, {});
      } catch (error) {
        console.log(error)
      }
    },
  
    async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('global_translation_metadata', null, {});
    }
};
