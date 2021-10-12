import * as Handlebars from 'handlebars';

import { CodeGeneratorParameters } from './types';

export const generateCode = (
  formattedMetadataObj: CodeGeneratorParameters,
  collectionType: string
) => {
  const template = Handlebars.compile(collectionType);
  const compiledTemplated = template(formattedMetadataObj);
  const programFile = compiledTemplated;

  return programFile;
};
