import {
  FormattedName,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
} from '../utils';

export const formatName = (str: string): FormattedName => ({
  snakeCase: toSnakeCase(str),
  normalCase: str,
  camelCase: toCamelCase(str),
  pascalCase: toPascalCase(str),
});
