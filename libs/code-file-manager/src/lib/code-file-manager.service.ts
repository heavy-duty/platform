import { Injectable } from '@angular/core';
import { IFormatedFullProgram } from '@heavy-duty/code-generator';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';

@Injectable()
export class CodeFileManagerService {
  generateSampleFile(templates: IFormatedFullProgram) {
    console.log(templates);
    const zip = new JSZip();
    zip.file('lib.rs', templates.application.template);

    // Creating collection folder and files
    const collectionFolder = zip.folder('collections');

    templates.collections.forEach((collection) => {
      collectionFolder?.file(collection.fileName, collection.template);
    });
    collectionFolder?.file('mod.rs', templates.collectionsMod.template);

    // Creating instructions folder and files
    const instructionsFolder = zip.folder('instrucctions');
    templates.instructions.forEach((instruction) => {
      instructionsFolder?.file(instruction.fileName, instruction.template);
    });
    instructionsFolder?.file('mod.rs', templates.instructionsMod.template);

    // Save a download file
    zip.generateAsync({ type: 'blob' }).then(function (content) {
      saveAs(content, 'program.code.zip');
    });
  }
}
