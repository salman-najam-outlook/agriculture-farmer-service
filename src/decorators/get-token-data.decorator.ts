import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const GetTokenData = createParamDecorator(
  (data: string, context: ExecutionContext): number => {
    const ctx = GqlExecutionContext.create(context).getContext();
    const headers = ctx.req.headers;
    return data ? headers?.[data] : headers;
  },
);

// export const CurrentUser = createParamDecorator(
//   (data: unknown, context: ExecutionContext) => {
//     const ctx = GqlExecutionContext.create(context);
//     return ctx.getContext().req.user;
//   },
// );
