import { Injectable, Inject, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import Redis from 'ioredis';
import axios from 'axios';
import { URL } from 'src/config/constant';

@Injectable()
export class PermissionService {
  private readonly apiPrototypeUrl = URL.CF_BASEURL;
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async hasPermission(userId: number, permissionId: string, authToken: string): Promise<boolean> {
    try {
      if (!userId) {
        return false;
      }
      // Get cached permissions
      const cacheKey = `user_permissions:${userId}`;
      let permissions = await this.redis.get(cacheKey);

      if (!permissions || permissions === 'null') {
        // Fetch from API and cache
        const url = `${this.apiPrototypeUrl}/admin/user-permissions/${userId}`;
        const response = await axios.get(url, {
          headers: { 'oauth-token': authToken }
        });

        if (response.data.success) {
          permissions = JSON.stringify(response.data.data);
          await this.redis.setex(cacheKey, this.CACHE_TTL, permissions);
        } else {
          return false;
        }
      }

      const userPermissions = JSON.parse(permissions);
      
      // Check if user has permission for this module
      const roles = userPermissions.roleIds || [];
      const eligiblePermissionId = roles.map((role: any) => `${role}_${permissionId}`);
      return userPermissions.moduleAndPermissions?.some((item: any) => {
           const hasPermission = eligiblePermissionId.includes(item.module_id);
           return hasPermission && item.permitted
         }
      ) || false;
    } catch (error) {
      return false;
    }
  }
  

  async checkPermission(permissionId: string, context: ExecutionContext): Promise<boolean> {
    try {
      // Extract userId from context
      const gqlCtx = context as any;
      const { req } = gqlCtx;
      const userId = parseInt(req?.headers?.cf_userid);
      const authToken = req?.headers?.authorization;

      if (!userId) {
        return false;
      }

      return await this.hasPermission(userId, permissionId, authToken);
    } catch (error) {
      return false;
    }
  }

  // Clear cache for specific user
  async clearUserCache(userId: number): Promise<void> {
    const cacheKey = `user_permissions:${userId}`;
    await this.redis.del(cacheKey);
  }
}
