import * as Case from 'case';
import * as Handlebars from 'handlebars';
import { Collection, CollectionAttribute } from '../state';
import { collectionTemplate } from './templates';
import { formatName, registerHandleBarsHelpers } from './utils';

const getAttributeKindName = (id: number, name: string, size: number) => {
	if (id === 0) {
		return 'bool';
	} else if (id === 1) {
		if (size <= 256) {
			return 'u8';
		} else if (size > 256 && size <= 65536) {
			return 'u16';
		} else if (size > 65536 && size <= 4294967296) {
			return 'u32';
		} else {
			throw Error('Invalid max');
		}
	} else if (id === 2 || id === 3) {
		return Case.capital(name);
	} else {
		throw Error('Invalid kind');
	}
};

export class CollectionCodeGenerator {
	static generate(
		collection: Collection,
		collectionAttributes: CollectionAttribute[]
	) {
		registerHandleBarsHelpers();

		return Handlebars.compile(collectionTemplate)({
			collection: {
				name: formatName(collection.name),
			},
			collectionAttributes: collectionAttributes.map((collectionAttribute) => ({
				name: formatName(collectionAttribute.name),
				kind: {
					...collectionAttribute.kind,
					name: getAttributeKindName(
						collectionAttribute.kind.id,
						collectionAttribute.kind.name,
						collectionAttribute.kind.size
					),
				},
				modifier: collectionAttribute.modifier,
			})),
		});
	}
}
