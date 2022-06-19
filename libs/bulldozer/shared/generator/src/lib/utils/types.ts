export interface FormattedName {
	snakeCase: string;
	normalCase: string;
	camelCase: string;
	pascalCase: string;
	kebabCase: string;
}

export interface CodeGeneratorParameters {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any; // TODO:  fix to support only
	// { collection: formatedCollection },
	// { instruction: formatedInstructions },
	// { instruction: formatedInstructions },
	// { program: formatedProgram },
}

interface ApplicationMetadata {
	template: string;
	name: FormattedName;
	collections: { template: string; name: FormattedName }[];
	instructions: { template: string; name: FormattedName }[];
	collectionsMod: { template: string };
	instructionsMod: { template: string };
}

export interface WorkspaceMetadata {
	applications: ApplicationMetadata[];
}

export interface InstructionViewItem {
	name: string;
	body: string;
}

export interface CollectionItemView {
	id: string;
	name: string;
}

export interface CollectionAttributeItemView {
	name: string;
	kind: {
		id: number;
		name: string;
		size: number;
	};
	modifier: {
		id: number;
		name: string;
		size: number;
	} | null;
}

export interface InstructionAccountItemView {
	id: string;
	name: string;
	kind: {
		id: number;
		name: string;
	};
	modifier: {
		id: number;
		name: string;
	} | null;
	collection: string | null;
	close: string | null;
	payer: string | null;
	space: number | null;
}

export interface InstructionAccountRelationItemView {
	from: string;
	to: string;
}

export interface InstructionArgumentItemView {
	name: string;
	kind: {
		id: number;
		name: string;
		size: number;
	};
	modifier: {
		id: number;
		name: string;
		size: number;
	} | null;
}
