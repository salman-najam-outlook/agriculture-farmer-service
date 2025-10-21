import { Inject, Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { MongoClient } from "mongodb";
import { MONGO_DB } from "src/config/constant";

@Injectable()
export class OfflineSyncService {
  private readonly db: any;
  private readonly failureCollection: any;
  private readonly activityCollection: any;
  private readonly isMongoAvailable: boolean;

  constructor(
    @Inject("MONGO_CLIENT") private readonly mongoClient: MongoClient | null
  ) {
    this.isMongoAvailable = !!this.mongoClient;

    if (this.isMongoAvailable) {
      try {
        this.db = this.mongoClient.db(MONGO_DB.DATABASE);
        this.failureCollection = this.db.collection(MONGO_DB.FAILURE_CONNECTION);
        this.activityCollection = this.db.collection(MONGO_DB.ACTIVITY_CONNECTION);
      } catch (error) {
        Logger.error(`Failed to initialize MongoDB collections: ${error.message}`);
        this.isMongoAvailable = false;
      }
    } else {
      Logger.warn('OfflineSyncService initialized without MongoDB connection - logging to MongoDB will be disabled');
    }
  }

  private async logToMongo(collection: any, data: any): Promise<void> {
    if (!this.isMongoAvailable) {
      Logger.debug('MongoDB logging skipped - connection not available');
      return;
    }

    try {
      await collection.insertOne({
        ...data,
        createdAt: new Date()
      });
    } catch (error) {
      Logger.error(`Failed to log to MongoDB: ${error.message}`);
      // Don't throw - we want to continue even if logging fails
    }
  }

  async makeApiCall(apiData: any, accessToken: string, lang: string) {
    try {
      const { action, payload, endPoint } = apiData;
      const sanitizedEndPoint = endPoint.startsWith("/")
        ? endPoint.slice(1)
        : endPoint;

      const response = await axios({
        url: `${process.env.BASEURL}/${sanitizedEndPoint}`,
        method: action,
        data: payload,
        headers: {
          "User-Agent": "client",
          "oauth-token": accessToken,
          lang,
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async sync(apiData: any[], headers: any) {
    const results = [];

    for (const api of apiData) {
      const response = await this.makeApiCall(api, headers.token, headers.lang);
      const isDuplicate = response.data?.message === "recordId already exists";

      const result = {
        success: response.data?.success ?? response.success,
        message:
          response.success && typeof response.data?.message === "string"
            ? response.data?.message
            : response.message || "Unknown error",
        status: response.success && isDuplicate ? "rejected" : "fulfilled",
        action: api.action,
        module: api.module,
        initial_payload: api.payload,
        api_response: {},
      };

      if (response.success && !isDuplicate) {
        result.api_response = {
          userId: headers.userId || null,
          recordId: api.payload?.recordId || null,
          id: api.payload?.id || null,
          ...(typeof response?.data === "object" ? response?.data : {}),
        };
      }

      results.push(result);

      // Log activity
      await this.logToMongo(this.activityCollection, {
        userId: headers.userId || null,
        orgId: headers.orgId || null,
        module: api.module,
        endpoint: api.endPoint,
        payload: api.payload,
        response: result.api_response,
        app_version_code: headers.appVersionCode,
        app_package_name: headers.appPackageName,
        app_version_name: headers.appVersionName,
      });

      // Log failures
      if (!response.success || isDuplicate) {
        await this.logToMongo(this.failureCollection, {
          userId: headers.userId || null,
          orgId: headers.orgId || null,
          module: api.module,
          endpoint: api.endPoint,
          payload: api.payload,
          reason: response.message,
          app_version_code: headers.appVersionCode,
          app_package_name: headers.appPackageName,
          app_version_name: headers.appVersionName,
        });
      }
    }

    return {
      msg: "Data synced successfully",
      data: results,
    };
  }
}