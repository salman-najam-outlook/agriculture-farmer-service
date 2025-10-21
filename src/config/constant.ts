require("dotenv").config();

export const MAX_NO_OF_FARMS = 25;
export const MAX_NO_OF_DEFORESTATION_REPORTS =
  Number.parseInt(process.env.MAX_NO_OF_DEFORESTATION_REPORTS) || 2;
export const MAX_NO_OF_DEFORESTATION_REPORTS_PER_FARM = 2;
export const ALLOWED_COUNTRY = ["PERU", "BRAZIL"];
export const INDONESIA_ROLES = ['indonesia_admin', "dds_exporter","dds_ptsi"]
export const KENYA_ROLES = ['naccu_naccu', 'naccu_kenya_admin']

export const CONSTANT = {
  LG_URL: "https://livestock-api-farmer-dev.dimitra.dev/pasture-mgmt/",
  DEFORESTATION_API_KEY:
    process.env.DEFORESTATION_API_KEY ||
    "Kofj2lGvJXXT1P27y-qMqgpWyivbgtUpRMgZ2NQVbe7KjL21gvwKSSvWLIW3gCRDfYc",
  DEFORESTATION_STATUS_CONFIG: [
    {
      label: 'Very High',
      colorName: "Dark Red",
      colorCode: "#8B0000",
      description: 'Analysis of the data from various satellites shows a very high probability that deforestation has occurred since the cutoff date (December 31, 2020) in the regions labeled as such.'
    },
    {
      label: 'High',
      colorName: "Red",
      colorCode: "#F03737",
      description: 'Analysis of the data from various satellites shows a high probability that deforestation has occurred since the cutoff date (December 31, 2020) in the regions labeled as such.'
    },
    {
      label: 'Medium',
      colorName: "Orange",
      colorCode: "#FFA520",
      description: 'Analysis of the data from various satellites shows a medium probability that deforestation has occurred since the cutoff date (December 31, 2020) in the regions labeled as such.'
    },
    {
      label: 'Low',
      colorName: "Light Blue",
      colorCode: "#60dbdb",
      description: 'Analysis of the data from various satellites shows a low probability that deforestation has occurred since the cutoff date (December 31, 2020) in the regions labeled as such.'
    },
    {
      label: 'Very Low',
      colorName: "Teal",
      colorCode: "#208080",
      description: 'Analysis of the data from various satellites shows a very low probability that deforestation has occurred since the cutoff date (December 31, 2020) in the regions labeled as such.'
    },
    {
      label: 'Zero/Negligible',
      colorName: "Transparent",
      colorCode: "#F1F4F7",
      description: 'Analysis of the data from various satellites shows a zero or negligible probability that deforestation has occurred since the cutoff date (December 31, 2020) in the regions labeled as such.'
    }
  ],
  DISPUTE_REPORT_PRODUCTION_PLACE_TO_EMAIL: process.env.DISPUTE_REPORT_PRODUCTION_PLACE_TO_EMAIL || "support@dimitra.io",
};

export const URL = {
  BASEURL:
    process.env.DEFORESTATION_SATELITE_URL ||
    "https://deforestation-api-dev.dimitra.dev",
  DETECT_DEFORESTATION_POLYGON: "/detect-deforestation-polygon",
  DETECT_DEFORESTATION_CIRCLE: "/detect-deforestation-circle",
  FETCH_IMAGE: "/get-image",
  GET_REGIONS: "/get-regions",
  CF_BASEURL: process.env.CF_BASEURL || "https://sass-api-dev.dimitra.dev/api",
  DETECT_DEFORESATION_BULK: "/detect-deforestation-bulk",
  DETECT_DEFORESTATION_MASS: "/detect-deforestation-mass",
  GET_DEFORESTATION_REQUEST_STATUS: "/detect-deforestation-mass-status",
  DETECT_DEFORESTATION_MASS_RESULT: "/detect-deforestation-mass-result",
  GET_DEFORESTATION_BREAKPOINT: "/overall-probability-breakpoints",
  DEFORESTRATION_REPORTING_API_BASE_URL: process.env.DEFORESTRATION_REPORTING_API_BASE_URL || "https://cf-reporting-dev.dimitra.dev/api"
};

export const RABBIT_MQ = {
  HOST: process.env.RABBIT_HOST,
  USERNAME: process.env.RABBIT_USERNAME,
  PASSWORD: process.env.RABBIT_PASSWORD,
};

export const MONGO_DB = {
  URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
  FAILURE_CONNECTION: process.env.MONGO_DB_Failure_COLLECTION,
  ACTIVITY_CONNECTION: process.env.MONGO_DB_ACTIVITY_COLLECTION,
  DATABASE: process.env.MONGO_DB,
}

export const DEFAULT_AREA_IN_HECTOR = 4;
export const HECTOR_TO_ACRE_FACTOR =2.47105
export const DEFAULT_RADIUS_IN_METER = 112.84;