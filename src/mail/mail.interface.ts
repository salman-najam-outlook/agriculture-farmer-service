export interface emailParams {
  toEmail: string | Array<string>;
  ccEmail?: string | Array<string>;
  subject?: string;
  contentParams?: any | null;
  // attachmentParams: any | null;
}
