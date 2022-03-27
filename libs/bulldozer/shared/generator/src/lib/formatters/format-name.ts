import {
  FormattedName,
  toCamelCase,
  toKebabCase,
  toPascalCase,
  toSnakeCase,
} from '../utils';

export const formatName = (str: string): FormattedName => ({
  snakeCase: toSnakeCase(str),
  normalCase: str,
  camelCase: toCamelCase(str),
  pascalCase: toPascalCase(str),
  kebabCase: toKebabCase(str),
});
