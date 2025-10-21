import { SetMetadata } from '@nestjs/common';

export const ModulesAllowed = (...modules) => SetMetadata('modules', modules);
