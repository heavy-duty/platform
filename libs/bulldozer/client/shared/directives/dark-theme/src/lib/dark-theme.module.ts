import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DarkThemeDirective } from './dark-theme.directive';

@NgModule({
  declarations: [DarkThemeDirective],
  imports: [CommonModule],
  exports: [DarkThemeDirective],
})
export class DarkThemeDirectiveModule {}
