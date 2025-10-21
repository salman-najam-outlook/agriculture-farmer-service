import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ClientIPMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ClientIPMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    try {
      const clientIP = this.extractClientIP(req);
      
      // Add client IP to request object for easy access
      (req as any).clientIP = clientIP;
      
      // Also add to headers for backward compatibility
      req.headers['client_ip'] = clientIP;
      

      
      next();
    } catch (error) {
      this.logger.warn('Failed to capture client IP, continuing with unknown', error);
      (req as any).clientIP = 'unknown';
      req.headers['client_ip'] = 'unknown';
      next();
    }
  }

  /**
   * Extract client IP address from request with priority order
   * @param req Express request object
   * @returns Client IP address string
   */
  private extractClientIP(req: Request): string {
    // Priority 1: Check for original client IP header (gateway service)
    const originalClientIP = req.headers['x-original-client-ip'] as string;
    if (originalClientIP && this.isValidIP(originalClientIP)) {
      return originalClientIP;
    }

    // Priority 2: Check for forwarded IP (proxy/load balancer)
    const forwardedFor = req.headers['x-forwarded-for'] as string;
    if (forwardedFor) {
      // Get the first IP in the chain (original client IP)
      const firstIP = forwardedFor.split(',')[0].trim();
      if (this.isValidIP(firstIP)) {
        return firstIP;
      }
    }

    // Priority 3: Check for real IP header
    const realIP = req.headers['x-real-ip'] as string;
    if (realIP && this.isValidIP(realIP)) {
      return realIP;
    }

    // Priority 4: Check for remote address header
    const remoteAddr = req.headers['x-remote-addr'] as string;
    if (remoteAddr && this.isValidIP(remoteAddr)) {
      return remoteAddr;
    }

    // Priority 5: Fallback to socket remote address
    if (req.socket?.remoteAddress) {
      const socketIP = req.socket.remoteAddress;
      if (this.isValidIP(socketIP)) {
        return socketIP;
      }
    }

    // Final fallback
    return 'unknown';
  }

  /**
   * Basic IP address validation
   * @param ip IP address string to validate
   * @returns boolean indicating if IP is valid
   */
  private isValidIP(ip: string): boolean {
    if (!ip || ip === 'unknown' || ip === 'undefined') {
      return false;
    }

    // Basic IPv4 validation
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipv4Regex.test(ip)) {
      return true;
    }

    // Basic IPv6 validation (simplified)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (ipv6Regex.test(ip)) {
      return true;
    }

    // Check for localhost variants
    if (ip === 'localhost' || ip === '127.0.0.1' || ip === '::1') {
      return true;
    }

    return false;
  }
}
