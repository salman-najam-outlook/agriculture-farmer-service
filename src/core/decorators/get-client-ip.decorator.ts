import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract client IP address from request
 * Usage: @GetClientIP() clientIP: string
 * 
 * This decorator relies on ClientIPMiddleware to have already captured the IP
 * and added it to req.clientIP and req.headers['client_ip']
 */
export const GetClientIP = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    try {
      const request = ctx.switchToHttp().getRequest();
      
      // Primary: Get from request object (set by middleware)
      if (request.clientIP) {
        return request.clientIP;
      }
      
      // Fallback: Get from headers (set by middleware)
      if (request.headers && request.headers['client_ip']) {
        return request.headers['client_ip'];
      }
      
      // Final fallback
      return 'unknown';
    } catch (error) {
      console.warn('Failed to extract client IP from context:', error);
      return 'unknown';
    }
  },
);
