import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class CodeEditorSettingsService {
  private _codeEditorVisibility = new BehaviorSubject<boolean>(
    this.defaultValue
  );
  isCodeEditorVisible$ = this._codeEditorVisibility.asObservable();

  get defaultValue() {
    return localStorage.getItem('codeEditor-visibility') === 'true';
  }

  setCodeEditorVisibility(isCodeEditorVisible: boolean) {
    this._codeEditorVisibility.next(isCodeEditorVisible);
    localStorage.setItem(
      'codeEditor-visibility',
      isCodeEditorVisible.toString()
    );
  }
}
