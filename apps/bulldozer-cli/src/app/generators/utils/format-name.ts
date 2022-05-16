import { toCamelCase, toKebabCase, toPascalCase, toSnakeCase } from './to-case';

export interface FormattedName {
	snakeCase: string;
	normalCase: string;
	camelCase: string;
	pascalCase: string;
	kebabCase: string;
}

export const formatName = (str: string): FormattedName => ({
	snakeCase: toSnakeCase(str),
	normalCase: str,
	camelCase: toCamelCase(str),
	pascalCase: toPascalCase(str),
	kebabCase: toKebabCase(str),
});
