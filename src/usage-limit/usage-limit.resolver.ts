import {Args, Query, Resolver} from '@nestjs/graphql';
import {UsesLimitInput, UsesLimitOutput} from "./dto/uses-limit.input";
import {UsageLimitService} from "./usage-limit.service";

@Resolver()
export class UsageLimitResolver {
    constructor(
        private readonly usageLimitService: UsageLimitService
    ) {}
    @Query(() => [UsesLimitOutput])
    async usageLimits(
        @Args('input', { nullable: true }) input?: UsesLimitInput,
    ) {
        return this.usageLimitService.getUsageLimit(input)
    }
}
