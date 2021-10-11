import { IFormatedName } from './types';
import {
  __collections_template,
  __rust_template,
  __instructions_body_template,
  __instructions_template,
} from './templates';

export const toCamelCase = (str: string) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
};

export const toPascalCase = (str: string) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word) {
      return word.toUpperCase();
    })
    .replace(/\s+/g, '');
};

export const toSnakeCase = (str: string) => {
  return str
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('_');
};

export const formatName = (str: string | undefined): IFormatedName | null => {
  if (!str) return null;
  return {
    snakeCase: toSnakeCase(str),
    normalCase: str,
    camelCase: toCamelCase(str),
    pascalCase: toPascalCase(str),
  };
};

export const getTemplateByType = (type: string): string => {
  switch (type) {
    case 'full_program':
      return __rust_template;
    case 'collections_program':
      return __collections_template;
    case 'instructions_program':
      return __instructions_template;
    case 'instructions_body_program':
      return __instructions_body_template;
    default:
      return __rust_template;
  }
};
