import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DarkThemeDirective } from './dark-theme.directive';
import { DarkThemeService } from './dark-theme.service';


@NgModule({
  declarations: [DarkThemeDirective],
  imports: [CommonModule],
  providers: [DarkThemeService],
  exports: [DarkThemeDirective],
})
export class DarkThemeModule {}
