export interface ISyncUser {
  cfUserId: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  countryCode: number;
  countryId: number;
  countryIsoCode: string;
  language: string;
  organizationId?: number;
  subOrganizationId?: number | null;
  organization: {
    id?: number;
    name: string;
    code: string;
    primaryUserId?:number
    parentId?: number
    subOrganization?: any,
    isSubOrganization?: number
  };
  eoriNumber: string;
  role: string;
  verified: boolean;
  address: string;
  licenseNumber: string;
  companyId: string;
  profilePicUrl?: string;
  active: boolean;
  source?: string;
  registrationUserType?: string;
}
