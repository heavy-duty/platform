import {
  FormattedName,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
} from '../utils';

export const formatName = (str: string): FormattedName => {
  return {
    snakeCase: toSnakeCase(str),
    normalCase: str,
    camelCase: toCamelCase(str),
    pascalCase: toPascalCase(str),
  };
};
