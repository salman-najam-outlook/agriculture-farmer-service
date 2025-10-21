import { createHash } from 'crypto';

const defaultToNonNull = (...values: any[]) => {
  return values.find((item) => item !== null && typeof item !== 'undefined' && !isNaN(item));
};

const generateHash = (value: any): null | string => {
  if (!value) return null;
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
};

export const getCoordinateHash = (
  circularOrPolygonCoordinates: any
): string => {
  if (!circularOrPolygonCoordinates) return null;
  if (Array.isArray(circularOrPolygonCoordinates)) {
    const cleanCoordinates = [];
    circularOrPolygonCoordinates.forEach((coordinate) => {
      const lng = Number(defaultToNonNull(coordinate.lng, coordinate.log, coordinate.longitude));
      const lat = Number(defaultToNonNull(coordinate.lat, coordinate.latitude));
      const newCoordinate = [Number(lng.toFixed(6)), Number(lat.toFixed(6))];
      if (cleanCoordinates.length) {
        const previousCoordinate = cleanCoordinates[cleanCoordinates.length - 1];
        if (previousCoordinate[0] !== newCoordinate[0] || previousCoordinate[1] !== newCoordinate[1]) {
          cleanCoordinates.push(newCoordinate);
        }
      } else {
        cleanCoordinates.push(newCoordinate);
      }
    });

    const isLastAndFirstSame =
      cleanCoordinates[0][0] === cleanCoordinates[cleanCoordinates.length - 1][0] &&
      cleanCoordinates[0][1] === cleanCoordinates[cleanCoordinates.length - 1][1];
    if (isLastAndFirstSame) cleanCoordinates.pop();

    let sortIdx = 0;
    for (let i = 1; i < cleanCoordinates.length; i++) {
      if (
        cleanCoordinates[i][0] < cleanCoordinates[sortIdx][0] ||
        (cleanCoordinates[i][0] === cleanCoordinates[sortIdx][0] &&
          cleanCoordinates[i][1] < cleanCoordinates[sortIdx][1])
      ) {
        sortIdx = i;
      }
    }

    cleanCoordinates.push(...cleanCoordinates.splice(0, sortIdx));
    cleanCoordinates.push(cleanCoordinates[0]);
    return generateHash(cleanCoordinates);
  } else {
    const lng = Number(
      defaultToNonNull(
        circularOrPolygonCoordinates.lng,
        circularOrPolygonCoordinates.log,
        circularOrPolygonCoordinates.geofenceCenterLog,
        circularOrPolygonCoordinates.centerLongitude,
        circularOrPolygonCoordinates.longitude
      )
    );
    const lat = Number(
      defaultToNonNull(
        circularOrPolygonCoordinates.lat,
        circularOrPolygonCoordinates.geofenceCenterLat,
        circularOrPolygonCoordinates.centerLatitude,
        circularOrPolygonCoordinates.latitude
      )
    );
    const radius = Number(
      defaultToNonNull(circularOrPolygonCoordinates.radius, circularOrPolygonCoordinates.geofenceRadius)
    );
    const newCoordinate = [Number(lng.toFixed(6)), Number(lat.toFixed(6)), radius];
    return generateHash(newCoordinate);
  }
};
