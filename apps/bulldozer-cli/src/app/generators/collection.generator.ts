import * as Handlebars from 'handlebars';
import { Collection, CollectionAttribute } from '../state';
import { collectionTemplate } from './templates';
import { formatName, registerHandleBarsHelpers } from './utils';

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
				kind: collectionAttribute.kind,
				modifier: collectionAttribute.modifier,
			})),
		});
	}
}
