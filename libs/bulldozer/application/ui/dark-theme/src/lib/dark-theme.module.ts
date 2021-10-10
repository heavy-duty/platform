import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DarkThemeDirective } from './dark-theme.directive';
import { DarkThemeService } from './dark-theme.service';
import { DarkThemeSwitchComponent } from './dark-theme-switch.component';

import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [DarkThemeDirective, DarkThemeSwitchComponent],
  imports: [CommonModule, MatIconModule, MatSlideToggleModule],
  providers: [DarkThemeService],
  exports: [DarkThemeDirective, DarkThemeSwitchComponent],
})
export class DarkThemeModule {}
