import { InjectionToken } from '@angular/core';

import { ProgramConfigs } from './utils';

export const PROGRAM_CONFIGS = new InjectionToken<ProgramConfigs>(
  'NG_ANCHOR_PROGRAM_CONFIGS'
);
