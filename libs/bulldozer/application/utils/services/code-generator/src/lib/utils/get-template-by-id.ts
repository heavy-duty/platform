import {
  __collections_program,
  __full_program,
  __instructions_context_program,
  __instructions_handler_program,
  __mod_program,
  __migrations_deploy,
  __program_xargo,
} from '../templates';
import { __anchor } from '../templates/anchor/__anchor';
import { __cargo } from '../templates/anchor/__cargo';
import { __program_cargo } from '../templates/anchor/__program_cargo';
import { __gitignore } from '../templates/anchor/__gitignore';
import { __prettierrc } from '../templates/anchor/__prettierrc';
import { __readme } from '../templates/anchor/__readme';
import { __tsconfig } from '../templates/anchor/__tsconfig';
import { __test } from '../templates/anchor/__test';
import { __packageJson } from '../templates/anchor/__packageJson';

export const getTemplateByType = (type: string): string => {
  switch (type) {
    case 'full_program':
      return __full_program;
    case 'collections_program':
      return __collections_program;
    case 'instructions_handler_template':
      return __instructions_handler_program;
    case 'instructions_context_program':
      return __instructions_context_program;
    case 'mod':
      return __mod_program;
    case 'migrations.deploy':
      return __migrations_deploy;
    case 'program.xargo':
      return __program_xargo;
    case 'program.cargo':
      return __program_cargo;
    case 'anchor':
      return __anchor;
    case 'cargo':
      return __cargo;
    case 'gitignore':
      return __gitignore;
    case 'prettierrc':
      return __prettierrc;
    case 'readme':
      return __readme;
    case 'tsconfig':
      return __tsconfig;
    case 'test':
      return __test;
    case 'packageJson':
      return __packageJson;
    default:
      return __full_program;
  }
};
