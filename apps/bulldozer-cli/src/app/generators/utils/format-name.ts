import * as Case from 'case';

export interface FormattedName {
	snakeCase: string;
	normalCase: string;
	camelCase: string;
	pascalCase: string;
	kebabCase: string;
}

export const formatName = (str: string): FormattedName => ({
	normalCase: str,
	snakeCase: Case.snake(str),
	camelCase: Case.camel(str),
	pascalCase: Case.pascal(str),
	kebabCase: Case.kebab(str),
});
