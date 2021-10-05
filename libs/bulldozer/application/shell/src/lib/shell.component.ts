import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'bd-shell',
  template: ` <bd-navigation> shells </bd-navigation> `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {}
