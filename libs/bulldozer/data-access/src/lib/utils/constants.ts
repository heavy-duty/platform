import { InjectionToken } from '@angular/core';

import { ProgramConfig } from './types';

export const PROGRAM_CONFIG = new InjectionToken<ProgramConfig>(
  'PROGRAM_CONFIG'
);
