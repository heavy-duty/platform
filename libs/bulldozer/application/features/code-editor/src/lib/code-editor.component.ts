import { Component, Input } from '@angular/core';
import { DarkThemeService } from '@heavy-duty/bulldozer/application/ui/dark-theme';
import { map } from 'rxjs/operators';

@Component({
  selector: 'bd-code-editor',
  template: `
    <ngx-monaco-editor
      class="{{ customClass }}"
      [options]="editorOptions$ | ngrxPush"
      [ngModel]="template"
    ></ngx-monaco-editor>
  `,
  styles: [],
})
export class CodeEditorComponent {
  @Input() template: string | null = null;
  @Input() customClass = '';
  @Input() readOnly = false;

  readonly isDarkThemeEnabled$ = this._themeService.isDarkThemeEnabled$;
  readonly editorOptions$ = this._themeService.isDarkThemeEnabled$.pipe(
    map((isDarkThemeEnabled) => ({
      theme: isDarkThemeEnabled ? 'vs-dark' : 'vs-light',
      language: 'rust',
      automaticLayout: true,
      readOnly: this.readOnly,
      fontSize: 16,
    }))
  );

  constructor(private readonly _themeService: DarkThemeService) {}
}
