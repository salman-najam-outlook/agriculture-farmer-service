import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Observable, tap } from "rxjs";
import { MetadataService } from "src/metadata/metadata.service";

@Injectable()
export class UserMetadataInterceptor implements NestInterceptor {
    constructor(private readonly metadataService: MetadataService) {}
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        return next.handle().pipe(
            tap(async () => {
                try {
                    const { req } = GqlExecutionContext.create(context).getContext();
                    
                    // Get IP address from middleware or headers
                    let ipAddress = 'unknown';
                    if (req.clientIP) {
                        ipAddress = req.clientIP;
                    } else if (req.headers && req.headers['client_ip']) {
                        ipAddress = req.headers['client_ip'];
                    } else if (req.headers && req.headers['x-original-client-ip']) {
                        ipAddress = req.headers['x-original-client-ip'];
                    }
                    
                    const clientMetadata = {
                        ...JSON.parse(req.headers.clientmetadata),
                        ipAddress: ipAddress, // Override with actual IP from middleware
                        lang: req.headers.lang,
                        userId: Number.parseInt(req.headers.userid)
                    };

                    await this.metadataService.createUserMetadata(clientMetadata);
                } catch (error) {
                    Logger.error(`Failed to record client metadata with error: ${error}`)
                }
            })
        )
    }
}