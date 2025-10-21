const CSV_FILETYPES = ['text/csv'];
const XLSX_FILETYPES = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const GEOJSON_FILETYPES = ['application/geo+json', '.geojson'];
const TOPOJSON_FILETYPES = ['.topojson'];
const GEOPACKAGE_FILETYPES = ['.gpkg'];
const GEOBUF_FILETYPES = ['.pbf'];
const ACCEPTED_FILETYPES = [
  ...CSV_FILETYPES,
  ...XLSX_FILETYPES,
  ...GEOJSON_FILETYPES,
  ...TOPOJSON_FILETYPES,
  ...GEOPACKAGE_FILETYPES,
  ...GEOBUF_FILETYPES,
];


const getFileFormat = (file) => {
  const mimetype = file.mimetype;
  const extension = `.${file.originalname.split('.').pop()}`;
  const xlsExtensions = XLSX_FILETYPES.filter((type) => type.startsWith('.'));
  const csvExtensions = CSV_FILETYPES.filter((type) => type.startsWith('.'));
  const geojsonExtensions = GEOJSON_FILETYPES.filter((type) => type.startsWith('.'));
  const topojsonExtensions = TOPOJSON_FILETYPES.filter((type) => type.startsWith('.'));
  const geoPackageExtensions = GEOPACKAGE_FILETYPES.filter((type) => type.startsWith('.'));
  const geobufExtensions = GEOBUF_FILETYPES.filter((type) => type.startsWith('.'));
  if (XLSX_FILETYPES.includes(mimetype) || xlsExtensions.includes(extension)) return 'xls';
  if (CSV_FILETYPES.includes(mimetype) || csvExtensions.includes(extension)) return 'csv';
  if (GEOJSON_FILETYPES.includes(mimetype) || geojsonExtensions.includes(extension)) return 'geojson';
  if (TOPOJSON_FILETYPES.includes(mimetype) || topojsonExtensions.includes(extension)) return 'topojson';
  if (GEOPACKAGE_FILETYPES.includes(mimetype) || geoPackageExtensions.includes(extension)) return 'geopackage';
  if (GEOBUF_FILETYPES.includes(mimetype) || geobufExtensions.includes(extension)) return 'geobuf';
  return null;
};

export {ACCEPTED_FILETYPES, getFileFormat}