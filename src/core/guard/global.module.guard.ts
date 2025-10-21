import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Roles } from '../roles';

@Injectable()
export class GlobalModulesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    const headers = ctx.req.headers;
    // if(headers.memberships){
    //   const membership = JSON.parse(headers.memberships);
    //   console.log(
    //     membership,
    //     '-----------memberships---------------',
    //   );
    // }

    return true;
  }
}
