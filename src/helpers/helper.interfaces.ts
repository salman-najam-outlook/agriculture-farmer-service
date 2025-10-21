export enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export interface RequestOptions {
  method: string;
  url: string;
  data: any;
  header?: {
    [key: string]: string;
  };
}
