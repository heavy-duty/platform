import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';

@Injectable()
export class CodeFileManagerService {
  // zipFile: JSZip = new JSZip();

  constructor() {
    console.log(JSZip());
  }

  generateSampleFile(templates: {
    collections: string[];
    instructions: string[];
  }) {
    console.log(templates);
    const zip = new JSZip();
    zip.file('prgoram.rs', 'data');

    // Creating collection folder and files
    const collectionFolder = zip.folder('collections');

    templates.collections.forEach((template, index) => {
      collectionFolder?.file('collection_' + index + '.rs', template);
    });

    // Creating instructions folder and files
    const instructionsFolder = zip.folder('instrucctions');
    templates.instructions.forEach((template, index) => {
      instructionsFolder?.file('instruction_' + index + '.rs', template);
    });

    zip.generateAsync({ type: 'blob' }).then(function (content) {
      // see FileSaver.js
      saveAs(content, 'program.code.zip');
    });
  }
}
