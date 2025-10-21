export const questions = [
  {
    heading:
      "Criteria (b and f) of the risk assessment and topic B and C from local legislation",
    questions: [
      // Default file question
      {
        title: "Attach File",
        assessmentQuestionType: "FILE_ATTACHMENT",
        isFileType: 1,
        fileTypeAdditionalSettings: {
          allowComments: true,
          allowedFileTypes: ["pdf", "doc", "xlsx", "jpeg", "png"],
          allowMultipleAttachments: true,
        },
        answers: [],
        checklists: [],
      },
      {
        title:
          "Do you have any forested areas on your farm that are protected by national environmental laws?",
        assessmentQuestionType: "RADIO_BUTTON",
        isFileType: 0,
        fileTypeAdditionalSettings: null,
        answers: [
          {
            label: "Yes",
            value: "high",
          },
          {
            label: "I am unsure",
            value: "medium",
          },
          {
            label: "No",
            value: "zero",
          },
        ],
        checklists: [
          "Now, I have checked my farm's boundaries and confirmed there are no protected forests on my land.",
          "I have spoken with local forest workers and made sure now that there are not protected forests on my farm.",
          "I referred to records now which shows there are not protected forests on my farm.",
          "The forest on my farm is fully protected and free from degradation.",
        ],
      },

      {
        title:
          "Have you engaged in any activities that may lead to deforestation or forest degradation in your farm?",
        assessmentQuestionType: "RADIO_BUTTON",
        isFileType: 0,
        fileTypeAdditionalSettings: null,
        answers: [
          {
            label: "Yes",
            value: "high",
          },
          {
            label: "I am unsure",
            value: "medium",
          },
          {
            label: "No",
            value: "zero",
          },
        ],
        checklists: [
          "In the past before 2020, I may have unknowingly contributed to forest degradation. However, I have since implemented measures to ensure all forests on my farm are fully protected and no longer degraded or used for production.",
          "Due to economic pressures, I contributed to deforestation in the past, but since December 31, 2020, the forests are fully protected and no longer degraded or used for production.",
          "While there may have been instances of forest degradation previous 2020, I have fixed the situation by implementing comprehensive measures to fully preserve the forests on my farm.",
          "Though there may have been risks of deforestation in the past, I have since 2020 prioritized forest conservation. As of now, all forested areas on my farm are fully protected and free from degradation.",
        ],
      },

      {
        title:
          "Do you have any plans to clear forested areas to expand your farmland in the future?",
        assessmentQuestionType: "RADIO_BUTTON",
        isFileType: 0,
        fileTypeAdditionalSettings: null,
        answers: [
          {
            label: "Yes",
            value: "high",
          },
          {
            label: "I am not sure",
            value: "medium",
          },
          {
            label: "No",
            value: "zero",
          },
        ],
        checklists: [
          "Presently, I've integrated sustainable land use practices, avoiding further deforestation or forest degradation. Since December 31, 2020, the forests have become fully protected and are not degraded or used for any type of production.",
          "I previously did not consider the environmental impact of expanding into preserved regions. Now, I have committed to expanding only into non-forested, non-protected areas.",
          "There may have been plans to expand into forested regions before. However, I have since abandoned those plans to ensure compliance with environmental regulations.",
        ],
      },
    ],
  },

  {
    heading:
      "Criteria (c, d and e) of the risk assessment and topic A, D, F and G from local legislation",
    questions: [
      // Default file question
      {
        title: "Attach File",
        assessmentQuestionType: "FILE_ATTACHMENT",
        isFileType: 1,
        fileTypeAdditionalSettings: {
          allowComments: true,
          allowedFileTypes: ["pdf", "doc", "xlsx", "jpeg", "png"],
          allowMultipleAttachments: true,
        },
        answers: [],
        checklists: [],
      },
      {
        title:
          "Does your farm fall under indigenous people's protected or restricted area?",
        assessmentQuestionType: "RADIO_BUTTON",
        isFileType: 0,
        fileTypeAdditionalSettings: null,
        answers: [
          {
            label: "Yes",
            value: "high",
          },
          {
            label: "I am not sure",
            value: "medium",
          },
          {
            label: "No",
            value: "zero",
          },
        ],
        checklists: [
          "I was not fully aware of the boundaries of protected areas, but I have since mapped my farm and confirmed its compliance.",
          "My farm's status was ambiguous, but I have now confirmed it does not infringe on any protected or restricted areas.",
        ],
      },

      {
        title:
          "Have your farm resourced any inputs from indigenous people’s community area that led to deforestation or mining?",
        assessmentQuestionType: "RADIO_BUTTON",
        isFileType: 0,
        fileTypeAdditionalSettings: null,
        answers: [
          {
            label: "Yes",
            value: "high",
          },
          {
            label: "I am unsure",
            value: "medium",
          },
          {
            label: "No",
            value: "zero",
          },
        ],
        checklists: [
          "I was unaware of the origin of some inputs, but I have now traced all sources and ensured they comply with environmental standards.",
          "I initially lacked proper documentation, but I have now conducted a thorough review to ensure all inputs are legally and ethically sourced.",
          "My previous suppliers did not provide full transparency, but I have now switched to verified sources that comply with all regulations",
        ],
      },

      {
        title:
          "If you brought any inputs from Indigenous people, do you have proper documentation?",
        answers: [
          {
            label: "Yes",
            value: "zero",
          },
          {
            label: "The farm doesn’t bring inputs from Indigenous communities",
            value: "zero",
          },
          {
            label: "I am not sure",
            value: "medium",
          },
          {
            label: "No",
            value: "high",
          },
        ],
        assessmentQuestionType: "RADIO_BUTTON",
        isFileType: 0,
        fileTypeAdditionalSettings: null,
        checklists: [
          "I had incomplete documentation initially, but I have now obtained all necessary permits and records.",
          "There was a delay in receiving some documents, but I have now secured and organized all required paperwork.",
        ],
      },
      {
        title:
          "Have you consulted with indigenous communities about your farm's impact on their land, rights, and culture?",
        answers: [
          {
            label: "Yes",
            value: "zero",
          },
          {
            label: "My farm is not located near any indigenous communities.",
            value: "zero",
          },
          {
            label: "No",
            value: "medium",
          },
        ],
        assessmentQuestionType: "RADIO_BUTTON",
        isFileType: 0,
        fileTypeAdditionalSettings: null,
        checklists: [
          "I did not know the importance of such consultations. I included regular meetings with indigenous representatives in my farm management practices.",
          "I established regular consultations with indigenous leaders to address concerns and respect cultural practices.",
          "Sought expert advice on Indigenous rights and updated farm policies to include ongoing community engagement",
        ],
      },

      {
        title:
          "Have there been any disputes or conflicts related to land ownership or land use involving indigenous communities?",
        answers: [
          {
            label: "Yes",
            value: "high",
          },
          {
            label: "I am not sure",
            value: "medium",
          },
          {
            label: "No",
            value: "zero",
          },
        ],
        assessmentQuestionType: "RADIO_BUTTON",
        isFileType: 0,
        fileTypeAdditionalSettings: null,
        checklists: [
          "There were past disputes that have since been resolved through legal and community mediation.",
          "I was unaware of some historical conflicts, but I have reviewed and addressed all issues with the relevant parties.",
        ],
      },

      {
        title: "Do you employ members of indigenous communities on your farm?",
        answers: [
          {
            label: "Yes, I employed members of indigenous community",
            value: "Standard",
          },
          {
            label:
              "Yes, I employed members of indigenous community and ensure their rights and cultural practices are respected",
            value: "zero",
          },
          {
            label: "No, I didn’t employ members of indigenous community",
            value: "zero",
          },
        ],
        assessmentQuestionType: "RADIO_BUTTON",
        isFileType: 0,
        fileTypeAdditionalSettings: null,
        checklists: [
          "In the past, I did not consider the cultural practices of indigenous employees. Now, I have implemented training programs to ensure all workers respect these practices.",
          "Previously, I employed indigenous workers without specific policies to protect their rights. I have now established clear guidelines to ensure their rights are safeguarded.",
          "Earlier, I did not have a formal process to engage with indigenous communities. I now regularly consult with community leaders to ensure my farm respects their cultural heritage.",
        ],
      },
      {
        title:
          "Do you comply with the laws and regulations related to the rights of indigenous peoples?",
        answers: [
          {
            label: "Yes",
            value: "zero",
          },
          {
            label: "I am not sure.",
            value: "Standard",
          },
          {
            label: "No",
            value: "high",
          },
        ],
        assessmentQuestionType: "RADIO_BUTTON",
        isFileType: 0,
        fileTypeAdditionalSettings: null,
        checklists: [
          "I was not fully informed about all regulations, but I have now studied and ensured compliance with all relevant laws.",
          "My compliance records were incomplete, but I have now updated them to reflect adherence to all standards.",
          "Compliance measures were not documented, but I have now formalized and documented all compliance efforts to ensure transparency.",
        ],
      },
    ],
  },

  {
    heading:
      "Criteria (h) of the risk assessment and topic A, D, E, F and H from local legislation",
    questions: [
      // Default file question
      {
        title: "Attach File",
        assessmentQuestionType: "FILE_ATTACHMENT",
        isFileType: 1,
        fileTypeAdditionalSettings: {
          allowComments: true,
          allowedFileTypes: ["pdf", "doc", "xlsx", "jpeg", "png"],
          allowMultipleAttachments: true,
        },
        answers: [],
        checklists: [],
      },
      {
        title:
          "Do you declare that your operation complies with tax, anti-corruption, commercial and customs laws?",
        answers: [
          {
            label: "Yes",
            value: "zero",
          },
          {
            label: "I am not sure",
            value: "medium",
          },
          {
            label: "No",
            value: "high",
          },
        ],
        assessmentQuestionType: "RADIO_BUTTON",
        isFileType: 0,
        fileTypeAdditionalSettings: null,
        checklists: [
          "To my knowledge I now follow and implement all National and Regional laws on my farm.",
          "To my knowledge I have followed and implemented all National and Regional laws on my farm.",
          "Recently I have established and followed a detailed anti-corruption policy that defines corruption, outlines prohibited behaviors, and specifies consequences for violations, to follow all the applicable laws.",
        ],
      },

      {
        title:
          "Do you maintain the historical labor personal data records on your farm?",
        answers: [
          {
            label: "Yes",
            value: "zero",
          },
          {
            label: "I usually don’t hire workers",
            value: "zero",
          },
          {
            label: "I am not sure",
            value: "medium",
          },
          {
            label: "No",
            value: "high",
          },
        ],
        assessmentQuestionType: "RADIO_BUTTON",
        isFileType: 0,
        fileTypeAdditionalSettings: null,
        checklists: [
          "We recently started collecting and maintaining a record of all workers.",
          "Recently I started storing personal records which include IDs, Photo copies, Work permits, any other required documents as per my knowledge and government Policies.",
          "I have constant inquiries on personal data but I didn’t store them for more than a year, now we start collecting and maintaining a record of all workers.",
        ],
      },

      {
        title:
          "Do you prevent employees from gender or sexual violence in your farm?",
        answers: [
          {
            label: "Yes",
            value: "zero",
          },
          {
            label: "I usually don’t hire workers",
            value: "zero",
          },
          {
            label: "I am not sure.",
            value: "medium",
          },
          {
            label: "No",
            value: "high",
          },
        ],
        assessmentQuestionType: "RADIO_BUTTON",
        isFileType: 0,
        fileTypeAdditionalSettings: null,
        checklists: [
          "I have regular counselling sessions on gender sensitivity and sexual harassment for all employees.",
          "I have a strong grievance handling mechanism which I resolve faster.",
          "We conduct regular assessments and surveys to understand the prevalence of gender or sexual violence on the farm.",
          "I ensure there is a clear process for investigating and addressing complaints.",
        ],
      },

      {
        title: "There is any labor trafficking near or on your farm?",
        answers: [
          {
            label: "Yes",
            value: "high",
          },
          {
            label: "Partially ",
            value: "medium",
          },
          {
            label: "I usually don’t hire workers ",
            value: "zero",
          },
          {
            label: "No",
            value: "zero",
          },
        ],
        assessmentQuestionType: "RADIO_BUTTON",
        isFileType: 0,
        fileTypeAdditionalSettings: null,
        checklists: [
          "But in my farm I guarantee that all workers receive fair wages and have transparent, understandable contracts that comply with labor laws.",
          "But in my farm I have Perform frequent audits and inspections to ensure compliance with labor standards.",
        ],
      },
      {
        title: "Do you brief your workers in your farm about Do’s & Don'ts ?",
        answers: [
          {
            label: "Yes",
            value: "zero",
          },
          {
            label: "I usually don’t hire workers",
            value: "zero",
          },
          {
            label: "Partially",
            value: "medium",
          },
          {
            label: "No",
            value: "high",
          },
        ],
        assessmentQuestionType: "RADIO_BUTTON",
        isFileType: 0,
        fileTypeAdditionalSettings: null,
        checklists: [
          "Recently I started briefing about Do’s and Don'ts .",
          "Recently I have briefed labor on labor law, human trafficking prevention, and workplace safety to provide in-depth knowledge to workers.",
          "I have provided detailed Dos and Don'ts that cover labor rights, and procedures for reporting concerns.",
        ],
      },

      {
        title: "Does any Armed conflict occur near or on your farm?",
        answers: [
          {
            label: "Yes",
            value: "high",
          },
          {
            label: "Partially",
            value: "medium",
          },
          {
            label: "No",
            value: "zero",
          },
        ],
        assessmentQuestionType: "RADIO_BUTTON",
        isFileType: 0,
        fileTypeAdditionalSettings: null,
        checklists: [
          "I have ensured to maintain a zero-tolerance policy for violence, including armed conflict, within the Farm. I have clearly communicated this policy to all employees, contractors, and visitors.",
          "I have Regularly conducted threat assessments to identify potential risks and vulnerabilities related to armed conflict. ",
        ],
      },

      {
        title: "Do you follow national/local labor laws on your farm?",
        answers: [
          {
            label: "Yes",
            value: "zero",
          },
          {
            label: "Partially ",
            value: "medium",
          },
          {
            label: "No",
            value: "high",
          },
        ],
        assessmentQuestionType: "RADIO_BUTTON",
        isFileType: 0,
        fileTypeAdditionalSettings: null,
        checklists: [
          "Previously, I did not have fair wages, working hours policy, but now I have introduced these policies that cover fair wages, working hours, health and safety, and freedom of association.",
          "I have regularly trained workers on their rights, company policies, and how to recognize and report human rights violations.",
          "I have educated workers to handle reports effectively and sensitively.",
        ],
      },
    ],
  },

  {
    heading:
      "Criteria (g, i, j and l) of the risk assessment and topic H from local legislation",
    questions: [
      // Default file question
      {
        title: "Attach File",
        assessmentQuestionType: "FILE_ATTACHMENT",
        isFileType: 1,
        fileTypeAdditionalSettings: {
          allowComments: true,
          allowedFileTypes: ["pdf", "doc", "xlsx", "jpeg", "png"],
          allowMultipleAttachments: true,
        },
        answers: [],
        checklists: [],
      },
      {
        title: "Do you declare to provide the geofences for your farm?",
        answers: [
          {
            label: "Yes",
            value: "zero",
          },
          {
            label: "Partially",
            value: "medium",
          },
          {
            label: "No",
            value: "high",
          },
        ],
        assessmentQuestionType: "RADIO_BUTTON",
        isFileType: 0,
        fileTypeAdditionalSettings: null,
        checklists: [
          "I find difficulties in defining the boundaries of the farm due to unclear land demarcation but the geofences declared are to the best of my knowledge.",
          "I have insufficient technical knowledge for implementing geofencing technology but I provide the best geofences as possible.",
          "I could have inadvertent errors or oversight during the geofencing process, but now I use Dimitra app to check my farm and create accurate geofences.",
        ],
      },

      {
        title: "Do you report the amount harvested in each zone?",
        answers: [
          {
            label:
              "Yes, I report the amount harvested because it’s important to ensure proper traceability.",
            value: "zero",
          },
          {
            label: "I Partially report the harvest",
            value: "medium",
          },
          {
            label: "No, I don’t report the harvest",
            value: "high",
          },
        ],
        assessmentQuestionType: "RADIO_BUTTON",
        isFileType: 0,
        fileTypeAdditionalSettings: null,
        checklists: [
          "I find it challenging to measure and record my harvest, but I now use the Dimitra traceability system to help me with this.",
          "I didn’t have the right tools to measure my harvest before, but now I use new technology to track my harvest amounts.",
          "I struggled to provide accurate harvest information due to limited resources, but I have now implemented the Dimitra system to improve this.",
        ],
      },

      {
        title: "Do you mix your products with products from other farms?",
        answers: [
          {
            label: "Yes",
            value: "high",
          },
          {
            label: "Partially",
            value: "medium",
          },
          {
            label: "No",
            value: "zero",
          },
        ],
        assessmentQuestionType: "RADIO_BUTTON",
        isFileType: 0,
        fileTypeAdditionalSettings: null,
        checklists: [
          "I may have received unclear information about the product supply chain, but I avoid mixing products and keep good records.",
          "In the past, I might have mixed products without knowing the origin, but I now use the Dimitra Traceability System to avoid this.",
          "Using traditional methods passed down from generations can inadvertently lead to mixing of products whose origins are not fully known and documented, but now I use Dimita's Traceability System to eliminate this risk.",
        ],
      },
    ],
  },
];
