import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request } from "express";
import { UserDDS } from "src/users/entities/dds_user.entity";
import { User } from "src/users/entities/user.entity";
import { verify } from 'jsonwebtoken';
import { RequestMethod } from "src/helpers/helper.interfaces";
import { URL } from "src/config/constant";
import { ApiCallHelper } from "src/helpers/api-call.helper";
import { UsersDdsService } from "src/users/users-dds.service";
import { ISyncUser } from "src/users/dto/sync-user.input";

@Injectable()
export class UpdateUserIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger(UpdateUserIdMiddleware.name);

  constructor(private readonly apiCallHelper: ApiCallHelper, private readonly userDdsService: UsersDdsService) {}
  
  async use(req: Request, res: Response, next: NextFunction) {
    try{
      // Note: Client IP is now captured by ClientIPMiddleware
      // Access via req.clientIP or req.headers['client_ip']
      
      let cfUserId = req.headers["userid"] as string

      if(!cfUserId && (req.headers.authorization || req.headers["oauth-token"])) {
        const token = req.headers.authorization || req.headers["oauth-token"];
        const decodedToken = verify(
          token,
          process.env.JWT_SECRET || "hemantdimitraaccesstokensecret"
        );
        cfUserId = decodedToken?.data?.userId;
      }
      req.headers["cf_userid"] = cfUserId;
      if (cfUserId) {
        
        const ddsUser = await UserDDS.findOne({
          where: {
            cf_userid: cfUserId,
          }
        })
         
        const user = await User.findOne({
          where: {
            cf_userid: cfUserId,
          },
        });

        if (ddsUser) {
          req.headers["userid"] = ddsUser.id?.toString();
          req.headers["organizationid"] = ddsUser.organization?.toString();
          req.headers["subOrganizationId"] = ddsUser.subOrganizationId?.toString();
        }
        else if(user){
          try {
            await this.syncUserDetailsFromApi(cfUserId, req);
            if (!req.headers["userid"]) {
              req.headers["userid"] = user.id.toString();
              req.headers["organizationid"] = user.organization.toString();
              req.headers["subOrganizationId"] = null;
            }
          } catch (syncError) {
            req.headers["userid"] = user.id.toString();
            req.headers["organizationid"] = user.organization.toString();
            req.headers["subOrganizationId"] = null;
          }
        }
        else{
          try {
            await this.syncUserDetailsFromApi(cfUserId, req);
          } catch (syncError) {
            // Continue without setting userid header
          }
        }
      }

      console.log(JSON.stringify(req.headers), "from middleware header log")

      next();
    }
    catch(error){
      console.log(error, "from middleware error log")
      next();
    }
  }

  private async syncUserDetailsFromApi(cfUserId: string, req: Request) {
    const endpoint = `${URL.CF_BASEURL}/admin/user/${cfUserId}`;
    const token = req.headers.authorization || req.headers["oauth-token"];

    try {
      const response = await this.apiCallHelper.call(
        RequestMethod.GET,
        endpoint,
        { "oauth-token": token },
        {}
      );

      if (response.status == 200) {
        let data:any = {}
        data = response?.data?.data
        const userPayload: ISyncUser = {
          cfUserId: Number(cfUserId),
          firstName: data?.firstName,
          lastName: data?.lastName,
          email: data?.email,
          mobile: data?.mobile,
          countryCode: data?.countryCode,
          countryId: data?.countryId,
          countryIsoCode: data?.countryIsoCode,
          language: data?.language,
          organization: {
            name: data?.user_organization.name,
            code: data?.user_organization.code,
          },
          eoriNumber: data?.eoriNumber,
          role: data?.role,
          verified: data?.verified,
          address: data?.address,
          licenseNumber: data?.licenseNumber,
          companyId: data?.companyId,
          registrationUserType: data?.registrationUserType,
          active: data?.active,
        };

        const res = await this.userDdsService.synchronizeUserDetails(userPayload);
        req.headers["userid"] = res.id?.toString();
        req.headers["organizationid"] = data?.user_organization.id.toString();
      }
    } catch (error) {
      this.logger.error("Failed to sync user details from CF API", error.message);
    }
  }
}
