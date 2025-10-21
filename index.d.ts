interface Country {
  country_a2: string;
  country_a3: string;
  country_name: string;
}

interface Continent {
  continent_code: string;
  continent_name: string;
  countries: string[];
}

declare module 'geojson-places' {
  export const getCountries: () => Country[];
  export const getContinents: () => Continent[];
  export const lookUp: (
    latitude: number,
    longitude: number
  ) => {
    continent_code: string;
    country_a2: string;
    country_a3: string;
  } | null;
}
