import {
  __collections_program,
  __full_program,
  __instructions_context_program,
  __instructions_handler_program,
  __mod_program,
} from '../templates';

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
    default:
      return __full_program;
  }
};
