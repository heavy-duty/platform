import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'bd-application-shell',
  template: `<router-outlet></router-outlet>`,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationShellComponent {}
